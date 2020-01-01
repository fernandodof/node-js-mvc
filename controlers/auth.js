const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');
const sendgridConfig = require('../sendgrid-config.json');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_user: sendgridConfig.apiKey

    }
}))

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: req.flash('error')[0]
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                flashLoginErrorMessage(req);
                return res.redirect('/login');
            }

            user.isPasswordValid(password)
                .then((isValid) => {
                    if (isValid) {
                        req.session.isAuthenticated = true;
                        req.session.user = user;

                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }

                    flashLoginErrorMessage(req);
                    return res.redirect('/login');
                });
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false,
        errorMessage: req.flash('error')[0]
    });
};

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email: email })
        .then(existingUser => {
            if (existingUser) {
                req.flash('error', 'E-mail already exists');
                return res.redirect('/signup');
            }
            const newUser = new User({
                name: name,
                email: email,
                password: password
            });

            return newUser.save();
        })
        .then(() => {
            res.redirect('/login');
            transporter.sendMail({
                to: email,
                from: 'shop@shop.com',
                subject: 'Shop signup succeeded!',
                html: `<h1>${name} You successfully signedup!</h1>`
            }).catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

function flashLoginErrorMessage(req) {
    req.flash('error', 'Invalid email or password.');
}


