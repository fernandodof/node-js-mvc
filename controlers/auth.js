const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

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
            return transporter.sendMail({
                to: email,
                from: 'shop@shop.com',
                subject: 'Shop signup succeeded!',
                html: `<h1>${name} You successfully signedup!</h1>`
            }).catch(err => console.log(err));
        })
        .catch(err => console.log(err));
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
            console.log(err);
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
                const exppiresIn = Date.now() + 2 * 3600000;
                console.log(new Date(exppiresIn));
                user.resetTokenExpirationDate = exppiresIn;
                console.log(user.resetTokenExpirationDate);
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
                    return console.log(err);
                }
            })
            .catch(err => {
                console.log(err);
            })
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
        .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    console.log('post new password');
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
    }).catch(err => console.log(err))
}

function flashLoginErrorMessage(req) {
    req.flash('error', 'Invalid email or password.');
}


