const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');

const { returnError } = require('./../util/utilFunctions');

const User = require('../models/user');
const sendgridConfig = require('../sendgrid-config.json');


const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_user: sendgridConfig.apiKey
    }
}))

exports.getLogin = (req, res, next) => {
    res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: '',
        oldInputs: {},
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    const oldInputs = { email, password };

    if (!errors.isEmpty()) {
        const validationErrors = errors.array().reduce((map, value) => (map[value.param] = value.msg, map), {});
        return showLoginAgain(res, oldInputs, validationErrors)
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return showLoginAgain(res, oldInputs, []);
            }

            user.isPasswordValid(password)
                .then((isValid) => {
                    if (isValid) {
                        req.session.isAuthenticated = true;
                        req.session.user = user;

                        return req.session.save((err) => {
                            res.redirect('/');
                        });
                    }

                    return showLoginAgain(res, oldInputs, []);
                });
        })
        .catch(err => returnError(err, next));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false,
        oldInputs: {},
        validationErrors: []
    });
};

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            isAuthenticated: false,
            oldInputs: { name, email, password, confirmPassword },
            validationErrors: errors.array().reduce((map, value) => (map[value.param] = value.msg, map), {})
        });
    }

    const newUser = new User({
        name: name,
        email: email,
        password: password
    });

    newUser.save()
        .then(async () => {
            res.redirect('/login');
            try {
                return transporter.sendMail({
                    to: email,
                    from: 'shop@shop.com',
                    subject: 'Shop signup succeeded!',
                    html: `<h1>${name} You successfully signedup!</h1>`
                });
            }
            catch (err) {
                return returnError(err, next)
            }
        })
        .catch(err => returnError(err, next));
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset-passwrod',
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error')[0]
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            return res.redirect('/reset-password');
        }

        const token = buffer.toString('hex');

        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No user account with that email found');
                    return res.redirect('/reset-password');
                }

                user.resetToken = token;
                user.resetTokenExpirationDate = Date.now() + 2 * 3600000;
                return user.save();
            })
            .then(async () => {
                res.redirect('/');
                try {
                    return transporter.sendMail({
                        to: req.body.email,
                        from: 'shop@shop.com',
                        subject: 'Password reset',
                        html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password.</p>
                    `
                    });
                }
                catch (err) {
                    return returnError(err, next)
                }
            })
            .catch(err => returnError(err, next));
    });
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;

    User.findOne({ resetToken: token, resetTokenExpirationDate: { $gt: Date.now() } })
        .then(user => {
            if (user) {
                return res.render('auth/new-password', {
                    path: '/new-passwrod',
                    pageTitle: 'New Password',
                    errorMessage: req.flash('error')[0],
                    userId: user._id.toString(),
                    passwordToken: token
                });
            }

            res.redirect('/');
        })
        .catch(err => returnError(err, next));
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    User.findOne({
        _id: userId,
        resetToken: passwordToken,
        resetTokenExpirationDate: { $gt: Date.now() }
    }).then(user => {
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpirationDate = undefined;
        return user.save();
    }).then(() => {
        return res.redirect('/login');
    }).catch(err => returnError(err, next));
}

function showLoginAgain(res, oldInputs, validationErrors) {
    return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid email or password',
        oldInputs: oldInputs,
        validationErrors: validationErrors
    });
}