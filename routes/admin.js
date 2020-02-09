const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const adminController = require('../controlers/admin');

const validateProduct = () => {
    return [
        body('title', 'Product title is required').trim().custom((value) => {
            if (value.length < 2) {
                throw new Error('Product title must me at least 2 chraracters long')
            }
            return true;
        }),
        body('price', 'Price is invalid').isNumeric(),
        body('description').trim().custom((value) => {
            if (value.length < 10) {
                throw new Error('Product description must me at least 10 charactors long');
            }
            return true;
        })
    ];
}

router.get('/add-product', adminController.getAddProduct);

router.get('/products', adminController.getProducts);

router.post('/add-product', validateProduct(), adminController.postAddProduct);

router.get('/edit-product/:id', adminController.getEditProduct);

router.post('/edit-product', validateProduct(), adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;