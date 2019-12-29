const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }]
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
}

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('./../util/database').getDb;

// const collectionName = 'users';
// const ObjectID = mongodb.ObjectID;

// class User {
//     constructor(username, email, id, cart) {
//         this.username = username;
//         this.email = email;
//         this._id = id ? new ObjectID(id) : undefined;
//         this.cart = cart;
//     }

//     save() {
//         const db = getDb();
//         let dbOperation;
//         if (this._id) {
//             dbOperation = db.collection(collectionName).updateOne({ _id: this._id }, { $set: this });
//         } else {
//             dbOperation = db.collection(collectionName).insertOne(this);
//         }

//         return dbOperation
//             .then(result => result)
//             .catch(err => console.log(err));
//     }

//     addToCart(product) {
//         const db = getDb();
//         const cartProdctIndex = this.cart.items.findIndex(cartProduct => cartProduct.productId.toString() === product._id.toString());

//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if (cartProdctIndex >= 0) {
//             newQuantity += this.cart.items[cartProdctIndex].quantity;
//             updatedCartItems[cartProdctIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({ productId: new ObjectID(product._id), quantity: newQuantity });
//         }

//         const updatedCart = { items: updatedCartItems };
//         return this._saveCart(updatedCart);
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(item => item.productId);

//         return db.collection('products').find({ _id: { $in: productIds } }).toArray()
//             .then(products => {
//                 return products.map(product => {
//                     return {
//                         ...product,
//                         quantity: this.cart.items.find(item => item.productId.toString() === product._id.toString()).quantity
//                     };
//                 });
//             });
//     }

//     deleteItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());

//         return this._saveCart({ items: updatedCartItems });
//     }

//     addOrder() {
//         const db = getDb();

//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: this._id,
//                     name: this.name
//                 }
//             }
//             return db.collection('orders').insertOne(order);
//         }).then(result => {
//             this.cart = { items: [] };
//             return this._saveCart(this.cart);
//         })
//     }

//     getOrders() {
//         const db = getDb();

//         return db.collection('orders').find({ 'user._id': this._id }).toArray();
//     }

//     _saveCart(cart) {
//         const db = getDb();
//         return db.collection(collectionName).updateOne({ _id: this._id }, { $set: { cart: cart } });
//     }

//     static findById(id) {
//         const db = getDb();
//         return db.collection(collectionName).findOne({ _id: new mongodb.ObjectID(id) })
//             .then(user => {
//                 console.log(user);
//                 return user;
//             })
//             .catch(err => console.log(err));
//     }
// }


// module.exports = User;