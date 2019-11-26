const Sequelize = require('sequelize');
const sequelize = require('./../util/database');

const Product = sequelize.define('product', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        defaultValue: 'http://mehararts.com/category_image/demo.png'
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

module.exports = Product;