const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const path = require('path');
const rootDir = require('./util/path');
const errorsControler = require('./controlers/errors');

const MONGODB_URI = 'mongodb://localhost:27017/node_complete';

// Models
const User = require('./models/user');

const app = express();
const sessionStore = new mongodbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

//Routes
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

app.use((req, res, next) => {
    // Get first user (any) 
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorsControler.get404);

mongoose.connect(MONGODB_URI)
    .then(() => {
        User.findOne()
            .then(user => {
                // If there is no user create one
                if (!user) {
                    const user = new User({
                        name: 'Fernando',
                        email: 'fernando@mail.com',
                        cart: {
                            items: []
                        }
                    });
                    user.save();
                }
            })
            .catch(err => console.log(err));
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });