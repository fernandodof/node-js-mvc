const fs = require('fs');
const path = require('path');
const rootDir = require('./../util/path');
const productsFilePath = path.join(rootDir, 'data', 'products.json');

const Cart = require('./cart');

const getProductsFromFile = (cb) => {
    fs.readFile(productsFilePath, (err, data) => {
        if (err) {
            return cb([]);
        }
        return cb(JSON.parse(data));
    });
};

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                const existingProductIndex = products.findIndex(product => product.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;

                fs.writeFile(productsFilePath, JSON.stringify(updatedProducts), (err) => {
                    console.log(err);
                });
            } else {
                this.id = (products.length + 1).toString();
                products.push(this);
                fs.writeFile(productsFilePath, JSON.stringify(products), (err) => {
                    console.log(err);
                });
            }
        });
    }

    static deleteById(id) {
        getProductsFromFile(products => {
            const updatedProducts = products.filter(product => product.id !== id);
            fs.writeFile(productsFilePath, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    Cart.deleteProduct(id);
                }
                console.log(err);
            });
        });
    }

    static featchAll(cb) {
        getProductsFromFile(cb);
    }

    static findById(id, cb) {
        return getProductsFromFile(products => {
            return cb(products.find(product => product.id === id));
        });
    }

};