const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    return Product.featchAll(products => {
        return res.render('shop/product-list', {
            products: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    });
};

exports.getIndex = (req, res, next) => {
    return Product.featchAll(products => {
        return res.render('shop/index', {
            products: products,
            pageTitle: 'Shop',
            path: '/'
        });
    });
};

exports.getCart = (req, res, next) => {
    return res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart'
    });
};

exports.getCheckout = (req, res, next) => {
    return res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};