const fs = require('fs');
const path = require('path');
const rootDir = require('./../util/path');
const cartFilePath = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(product) {
        fs.readFile(cartFilePath, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            // Analyze cart and find existing product 
            const existingProductIndex = cart.products.findIndex(prod => prod.id === product.id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;

            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.quantity = updatedProduct.quantity + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: product.id, quantity: 1, price: product.price };
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + (+product.price);

            fs.writeFile(cartFilePath, JSON.stringify(cart), err => {
                console.log(err);
            });
        });
    }

    static deleteProduct(id) {
        fs.readFile(cartFilePath, (err, fileContent) => {
            if (err) {
                return;
            }

            const updatedCart = JSON.parse(fileContent);

            const product = updatedCart.products.find(product => product.id === id);

            if (!product) {
                return;
            }

            updatedCart.products = updatedCart.products.filter(product => product.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - (product.quantity * product.price);
            fs.writeFile(cartFilePath, JSON.stringify(updatedCart), err => {
                console.log(err);
            });
        })
    }

    static get(cb) {
        fs.readFile(cartFilePath, (err, fileContent) => {
            if (err) {
                return cb(null);
            }

            const cart = JSON.parse(fileContent);
            return cb(cart);
        });
    }
}