const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpirationDate: Date,
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            default: { items: [] }
        }],
    }
});

userSchema.methods.addToCart = function (product) {
    const cartProdctIndex = this.cart.items.findIndex(cartProduct => cartProduct.productId.toString() === product._id.toString());

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProdctIndex >= 0) {
        newQuantity += this.cart.items[cartProdctIndex].quantity;
        updatedCartItems[cartProdctIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({ productId: product._id, quantity: newQuantity });
    }

    this.cart = { items: updatedCartItems };
    return this.save();
};

userSchema.methods.removeProductFromCart = function (productId) {
    this.cart = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

userSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }

    // generate a salt
    bcrypt.genSalt(12, function (err, salt) {
        if (err) {
            return next(err);
        }

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
                return next(err);
            }

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.isPasswordValid = function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);