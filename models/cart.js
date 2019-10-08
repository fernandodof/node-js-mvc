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
                updatedProduct = { id: product.id, quantity: 1 };
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + (+product.price);

            fs.writeFile(cartFilePath, JSON.stringify(cart), err => {
                console.log(err);
            });
        });
    }
}