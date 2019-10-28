const Product = require('../models/product');
const Cart = require('../models/Cart');

exports.getProducts = (req, res, next) => {
    return Product.featchAll(products => {
        return res.render('shop/product-list', {
            products: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    });
};

exports.getProduct = (req, res, next) => {
    const id = req.params.id;
    return Product.findById(id, product => {
        return res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
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
    Cart.get(cart => {
        Product.featchAll(products => {
            const cartProducts = [];

            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if (cartProductData) {
                    cartProducts.push({ productData: product, quantity: cartProductData.quantity });
                };
            }

            return res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                cart: cartProducts
            });
        });
    })
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, (product) => {
        Cart.addProduct(product);
    });
    return res.redirect('/cart');

};

exports.postCartDeleteProduct = (req, res, next) => {
    const id = req.body.id;

    Cart.deleteProduct(id);
    return res.redirect('/');
};

exports.getOrders = (req, res, next) => {
    return res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders'
    });
};

exports.getCheckout = (req, res, next) => {
    return res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};