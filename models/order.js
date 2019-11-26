const Sequelize = require('sequelize');
const sequelize = require('./../util/database');

const Order = sequelize.define('order', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
});

module.exports = Order;