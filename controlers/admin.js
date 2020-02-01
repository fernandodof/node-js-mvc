const Product = require('../models/product');
const { validationResult } = require('express-validator/check');

const mongoose = require("mongoose");
const { returnError } = require('./../util/utilFunctions');

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
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = +req.body.price;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: 'Edit product',
            path: '/admin/add-product',
            editing: false,
            buttonLabel: 'Update Product',
            formAction: '/admin/add-product',
            oldInputs: { title, price, description, imageUrl },
            validationErrors: errors.array().reduce((map, value) => (map[value.param] = value.msg, map), {})
        });
    }

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user // or req.user._id 
    });
    product.save()
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.log(err));
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
        .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.id;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;
    const editMode = req.query.edit === 'true';

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: 'Edit product',
            path: '/admin/edit-product',
            editing: editMode,
            buttonLabel: 'Update Product',
            formAction: '/admin/edit-product',
            oldInputs: { _id: id, title, price, description, imageUrl },
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
            product.imageUrl = imageUrl;

            return product.save().
                then(() => res.redirect('/admin/products'));
        })
        .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
    return Product.find({ userId: req.user._id })
        .then(products => {
            return res.render('admin/products', {
                products: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        }).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.id;
    Product.deleteOne({ _id: id, userId: req.user._id })
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.log(err));
};