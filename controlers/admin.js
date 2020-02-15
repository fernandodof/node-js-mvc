const Product = require('../models/product');
const { validationResult } = require('express-validator/check');
const { returnError, deleteFile } = require('./../util/utilFunctions');
const path = require('path');

exports.getAddProduct = (req, res, next) => {
    return res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        buttonLabel: "Add Product",
        formAction: "/admin/add-product",
        oldInputs: {},
        validationErrors: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = +req.body.price;

    let validationErrors = {};
    if (!image) {
        validationErrors.image = 'Attached file is not an image';
    }

    const errors = validationResult(req);

    if (!errors.isEmpty() || !image) {
        validationErrors = {
            ...validationErrors,
            ...errors.array().reduce((map, value) => (map[value.param] = value.msg, map), {})
        }
        return res.render('admin/edit-product', {
            pageTitle: 'Edit product',
            path: '/admin/add-product',
            editing: false,
            buttonLabel: 'Update Product',
            formAction: '/admin/add-product',
            oldInputs: { title, price, description },
            validationErrors
        });
    }

    const imageUrl = `/${image.path.replace(/\\/g, '/')}`;;

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user // or req.user._id 
    });
    product.save()
        .then(() => res.redirect('/admin/products'))
        .catch(err => returnError(err, next));
};

exports.getEditProduct = (req, res, next) => {
    const id = req.params.id;
    const editMode = req.query.edit === 'true';
    Product.findById(id)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            return res.render('admin/edit-product', {
                pageTitle: 'Edit product',
                path: '/admin/edit-product',
                editing: editMode,
                buttonLabel: 'Update Product',
                formAction: '/admin/edit-product',
                oldInputs: product,
                validationErrors: []
            });
        })
        .catch(err => returnError(err, next));
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.id;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const image = req.file;
    const editMode = req.query.edit === 'true';

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: 'Edit product',
            path: '/admin/edit-product',
            editing: editMode,
            buttonLabel: 'Update Product',
            formAction: '/admin/edit-product',
            oldInputs: { _id: id, title, price, description },
            validationErrors: errors.array().reduce((map, value) => (map[value.param] = value.msg, map), {})
        });
    }

    Product.findById(id)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }

            product.title = title;
            product.price = price;
            product.description = description;

            if (image) {
                deleteFile(product.imageUrl);
                product.imageUrl = `/${image.path.replace(/\\/g, '/')}`;
            }

            return product.save().
                then(() => res.redirect('/admin/products'));
        })
        .catch(err => returnError(err, next));
};

exports.getProducts = (req, res, next) => {
    return Product.find({ userId: req.user._id })
        .then(products => {
            return res.render('admin/products', {
                products: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        }).catch(err => returnError(err, next));

};

exports.deleteProduct = (req, res, next) => {
    const id = req.params.id;

    Product.findById(id)
        .then(product => {
            if (!product) {
                return returnError('Product not found', next, 404);
            }
            deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: id, userId: req.user._id });
        })
        .then(() => res.status(200).json({ success: true, message: "product deleted" }))
        .catch(err => res.status(500).json({ success: false, message: "product deleted" }));
};