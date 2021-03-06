const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripeConfig = require('./../stripe.config');
const stripe = require('stripe')(stripeConfig.key);
const Product = require('./../models/product');
const Order = require('./../models/order');
const { returnError, generatePaginationData } = require('./../util/utilFunctions');
const PAGE_SIZE = 1;

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let total;

    return Product.find().countDocuments()
        .then(count => {
            total = count;
            return Product.find()
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE);
        })
        .then(products => {
            return res.render('shop/index', {
                products: products,
                pageTitle: 'All Products',
                path: '/products',
                paginationData: generatePaginationData(page, PAGE_SIZE, total)
            });
        })
        .catch(err => returnError(err, next));
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
        .catch(err => returnError(err, next));
};

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let total;

    return Product.find().countDocuments()
        .then(count => {
            total = count;
            return Product.find()
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE);
        })
        .then(products => {
            return res.render('shop/index', {
                products: products,
                pageTitle: 'Shop',
                path: '/',
                paginationData: generatePaginationData(page, PAGE_SIZE, total)
            });
        })
        .catch(err => returnError(err, next));
};

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            return res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                cart: user.cart.items
            });
        })
        .catch(err => returnError(err, next));
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

    req.user.removeProductFromCart(id)
        .then(() => res.redirect('/cart'))
        .catch(err => returnError(err, next));
};

exports.postOrder = (req, res, next) => {
    let total;
    let buyer;
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            total = user.cart.items.reduce((total, product) => (total + product.productId.price), 0)
            buyer = user;
            const products = user.cart.items.map(item => {
                return {
                    product: { ...item.productId._doc },
                    quantity: item.quantity
                };
            });
            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user
                },
                products: products
            })
            return order.save();
        })
        .then(result => {
            const charge = stripe.charges.create({
                amount: total * 100,
                currency: 'eur',
                description: `Test order - ${buyer.name} - ${new Date().toISOString()}`,
                source: req.body.stripeToken,
                metadata: { order_id: result._id.toString() }
            });

            req.user.clearCart();
        })
        .then(() => res.redirect('/orders'))
        .catch(err => returnError(err, next));
};

exports.getCheckout = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;

            res.render('shop/checkout', {
                pageTitle: 'Checkout',
                path: '/checkout',
                cart: products,
                total: products.reduce((total, product) => (total + product.productId.price), 0)
            });
        })
        .catch(err => returnError(err, next));
};

exports.getOrders = (req, res, next) => {
    console.log(res.locals);
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => returnError(err, next));
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId)
        .then((order) => {
            if (!order) {
                return returnError("No order found", next);
            }

            if (order.user.userId.toString() !== req.user._id.toString()) {
                return returnError("Unauthorized", next, 401);
            }

            const invoiceName = `test-${orderId}.pdf`;
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const pdfDocument = new PDFDocument();
            pdfDocument.pipe(fs.createWriteStream(invoicePath));
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
            pdfDocument.pipe(res);

            pdfDocument.fontSize(26).text('Invoice', { underline: true });
            pdfDocument.text('--------------------------');
            let total = 0;
            order.products.forEach(p => {
                pdfDocument.fontSize(14).text(`${p.product.title} - ${p.quantity} x $ ${p.product.price.toFixed(2)}`);
                total += p.quantity * p.product.price;
            });
            pdfDocument.text('\n');
            pdfDocument.fontSize(18).text(`Total price: $ ${total.toFixed(2)}`);
            pdfDocument.end();

            // const file = fs.createReadStream(path.join('data', 'invoices', invoiceName));
            // file.pipe(res);
        })
        .catch(err => returnError(err, next));

};