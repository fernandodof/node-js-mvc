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
    console.log(req.user, req.user.createProduct);
    req.user.createProduct({
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price
    })
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
    const id = req.params.id;
    const editMode = req.query.edit === 'true';
    req.user.getProducts({ where: { id: req.user.id } })
        // Product.findByPk(id)
        .then(products => {
            const product = products[0];
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
        })
        .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.id;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    Product.findByPk(id)
        .then(product => {
            product.title = title;
            product.imageUrl = imageUrl;
            product.description = description;
            product.price = price;

            return product.save();
        })
        .then(() => {
            console.log("Product updated");
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
    return req.user.getProducts()
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
    Product.findByPk(id)
        .then(product => product.destroy())
        .then(() => {
            console.log("Product destroyed")
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};