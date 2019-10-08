const fs = require('fs');
const path = require('path');
const rootDir = require('./../util/path');
const productsFilePath = path.join(rootDir, 'data', 'products.json');

const getProductsFromFile = (cb) => {
    fs.readFile(productsFilePath, (err, data) => {
        if (err) {
            return cb([]);
        }
        return cb(JSON.parse(data));
    });
};

module.exports = class Product {
    constructor(title, imageUrl, description, price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            this.id = (products.length + 1).toString();
            fs.writeFile(productsFilePath, JSON.stringify(products), (err) => {
                console.log(err);
            });
        })

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