const express = require('express');
const shopController = require('../controlers/shop');
const isAuth = require('./../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:id', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

module.exports = router;