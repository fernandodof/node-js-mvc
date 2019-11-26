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

    return Product.findByPk(id)
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
    req.user.getCart()
        .then(cart => {
            return cart.getProducts()
                .then(products => {
                    return res.render('shop/cart', {
                        pageTitle: 'Your Cart',
                        path: '/car t',
                        cart: products
                    });
                })
                .catch(err => console.log(err));;
        })
        .catch(errr => console.log(err));
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            const product = products[0] || undefined;

            if (product) {
                newQuantity += product.cartItem.quantity;
            }

            return Product.findByPk(productId);
        }).
        then(product => {
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
        })
        .then(() => res.redirect('/cart'))
        .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
    const id = req.body.id;

    req.user.getCart()
        .then(cart => cart.getProducts({ where: { id: id } }))
        .then(products => {
            const product = products[0] || ndefined;
            return product.cartItem.destroy();
        })
        .then(() => res.redirect('/'))
        .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    return order.addProducts(products.map(product => {
                        //add quantity to each product
                        product.orderItem = { quantity: product.cartItem.quantity };
                        return product;
                    }));
                })
                .catch(err => console.log(err));
        })
        .then(() => fetchedCart.setProducts(null))
        .then(() => res.redirect('/orders'))
        .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders({ include: ['products'] })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => console.log(err));
};