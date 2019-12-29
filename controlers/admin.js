const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    return res.render('admin/edit-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        buttonLabel: "Add Product",
        formAction: "/admin/add-product",
        product: {},
        isAuthenticated: req.session.isAuthenticated
    });
};

exports.postAddProduct = (req, res, next) => {
    // const id = req.params.id;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = +req.body.price;

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
                product: product,
                buttonLabel: "Update Product",
                formAction: "/admin/edit-product",
                isAuthenticated: req.session.isAuthenticated
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

    Product.findById(id)
        .then(product => {
            product.title = title;
            product.price = price;
            product.description = description;
            product.imageUrl = imageUrl;

            return product.save();
        })
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
    return Product.find()
        .then(products => {
            return res.render('admin/products', {
                products: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
                isAuthenticated: req.session.isAuthenticated
            });
        }).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.id;
    Product.findByIdAndRemove(id)
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.log(err));
};