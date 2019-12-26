const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const rootDir = require('./util/path');
const errorsControler = require('./controlers/errors');

const mongoConnect = require('./util/database').mongoConnect;

// Models
const User = require('./models/user');

const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));

app.use((req, res, next) => {
    User.findById('5de56f09300b9817b42beb83')
        .then(user => {
            req.user = new User(user.name, user.email, user._id, user.cart);
            next();
        }).catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

mongoConnect(() => {
    app.listen(3000);
});