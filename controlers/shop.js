const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Product = require('./../models/product');
const Order = require('./../models/order');
const { returnError } = require('./../util/utilFunctions');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            return res.render('shop/product-list', {
                products: products,
                pageTitle: 'All Products',
                path: '/products'
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
    Product.find()
        .then((products) => {
            return res.render('shop/index', {
                products: products,
                pageTitle: 'Shop',
                path: '/'
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
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
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
        .then(() => req.user.clearCart())
        .then(() => res.redirect('/orders'))
        .catch(err => returnError(err, next));
};

exports.getOrders = (req, res, next) => {
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