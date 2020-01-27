const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');

const authController = require('../controlers/auth');
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address.')
            .normalizeEmail(),
        body('password', 'Password has to be valid.')
            .isLength({ min: 6 })
            .trim()
    ],
    authController.postLogin);

router.post('/logout', authController.postLogout)

//signup

router.get('/signup', authController.getSignup);

router.post('/signup',
    [
        body('name', 'Please enter a valid name.').notEmpty(),
        body('email', 'Please enter a valid email.').isEmail().normalizeEmail().custom(async (value, { req }) => {
            const existingUser = await User.findOne({ email: value });
            if (existingUser) {
                return Promise.reject('E-mail already exists.');
            }
        }),
        body('password', 'Please enter a password with at least 6 characters.').trim().isLength({ min: 6 }),
        body('confirmPassword').trim().custom((value, { req }) => {
            if (!value) {
                throw new Error('Confirm password is required');
            }
            if (value !== req.body.password) {
                throw new Error('Paswword and confirm password do not match');
            }

            return true;
        })
    ],
    authController.postSignup);

//reset passwod

router.get('/reset-password', authController.getReset);

router.post('/reset-password', authController.postReset);

router.get('/reset-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;