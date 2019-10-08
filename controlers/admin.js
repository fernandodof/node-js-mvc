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
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product(title, imageUrl, description, price);
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