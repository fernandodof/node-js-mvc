const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then(products => {
            return res.render('shop/product-list', {
                products: products,
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const id = req.params.id;

    return Product.findById(id)
        .then(product => {
            return res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            return res.render('shop/index', {
                products: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
    req.user.getCart().then(products => {
        return res.render('shop/cart', {
            pageTitle: 'Your Cart',
            path: '/cart',
            cart: products
        }).catch(errr => console.log(err));
    });
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        }).then(() => {
            return res.redirect('/cart');
        });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const id = req.body.id;

    req.user.deleteItemFromCart(id)
        .then(() => res.redirect('/cart'))
        .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.user.addOrder()
        .then(() => res.redirect('/orders'))
        .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders()
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => console.log(err));
};