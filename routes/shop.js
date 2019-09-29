const express = require('express');
var path = require('path');
const rootDir = require('../util/path');

const router = express.Router();

router.get('/', (req, res, next) => {
    return res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;