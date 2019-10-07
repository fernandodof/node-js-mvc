const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    return res.render('admin/add-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const product = new Product(title, imageUrl, price, description);
    product.save();
    return res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    return Product.featchAll(products => {
        return res.render('admin/products', {
            products: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    });
};