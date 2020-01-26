const express = require('express');
const authController = require('../controlers/auth');
const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout)

//signup

router.get('/signup', authController.getSignup);

router.post('/signup', authController.postSignup);

//reset passwod

router.get('/reset-password', authController.getReset);

router.post('/reset-password', authController.postReset);

router.get('/reset-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;