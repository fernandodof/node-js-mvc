const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const path = require('path');
const csurf = require('csurf');
const flash = require('connect-flash');

const rootDir = require('./util/path');
const errorsControler = require('./controlers/errors');
const isAuth = require('./middleware/is-auth');

const MONGODB_URI = 'mongodb://localhost:27017/node_complete';

// Models
const User = require('./models/user');

const app = express();
const sessionStore = new mongodbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

// CSRF token
const csrfProtection = csurf();

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));
app.use(session({
    secret: 'bbb673d8-2a62-11ea-978f-2e728ce88125',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }

            req.user = user;
            next();
        })
        .catch(() => next(new Error("Error Trying to find the user")));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', isAuth, adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorsControler.get404);

app.get('/500', errorsControler.get500);

app.use((err, req, res, next) => {
    return res.render('500', {
        pageTitle: '500 - Error!!!',
        path: '/500',
        isAuthenticated: req.session.isAuthenticated
    });
});


mongoose.connect(MONGODB_URI)
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });