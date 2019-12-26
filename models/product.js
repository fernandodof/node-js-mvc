const mongodb = require('mongodb');
const getDb = require('./../util/database').getDb;

const collectionName = 'products';

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectID(id) : undefined;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        let dbOperation;
        if (this._id) {
            dbOperation = db.collection(collectionName).updateOne({ _id: this._id }, { $set: this });
        } else {
            dbOperation = db.collection(collectionName).insertOne(this);
        }

        return dbOperation
            .then(result => result)
            .catch(err => console.log(err));
    }

    static findAll() {
        const db = getDb();
        return db.collection(collectionName).find().toArray()
            .then(products => products)
            .catch(err => console.log(err));
    }

    static findById(id) {
        const db = getDb();
        return db.collection(collectionName).find({ _id: new mongodb.ObjectID(id) }).next()
            .then(product => product)
            .catch(err => console.log(err));
    }

    static deleteById(id) {
        const db = getDb();

        return db.collection(collectionName).deleteOne({ _id: new mongodb.ObjectID(id) })
            .then(() => console.log('Deleted'))
            .catch(err => console.log(err));
    }
}

module.exports = Product;