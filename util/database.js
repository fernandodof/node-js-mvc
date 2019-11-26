// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: 'admin',
//     database: 'node_complete'
// });

// module.exports = pool.promise();

const Sequelize = require('sequelize');

const sequelize = new Sequelize('node_complete', 'root', 'admin',
    {
        dialect: 'mysql',
        host: 'localhost'
    }
);

module.exports = sequelize;
