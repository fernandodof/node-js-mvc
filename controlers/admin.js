const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    return res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        buttonLabel: "Add Product",
        formAction: "/admin/add-product",
        product: {}
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = +req.body.price;

    const product = new Product(null, title, imageUrl, description, price);
    product.save();
    return res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
    const id = req.params.id;
    const editMode = req.query.edit === 'true';
    Product.findById(id, product => {
        if (!product) {
            return res.redirect('/');
        }
        return res.render('admin/edit-product', {
            pageTitle: 'Edit product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product,
            buttonLabel: "Update Product",
            formAction: "/admin/edit-product"
        });
    });
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.id;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product(id, title, imageUrl, description, price);
    product.save();

    return res.redirect('/admin/products');
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

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.id;
    Product.deleteById(id);
    return res.redirect('/admin/products');
};