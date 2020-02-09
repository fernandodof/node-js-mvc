const fs = require('fs');

exports.returnError = (err, next, code = 500) => {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = code;
    return next(error);
}

exports.deleteFile = (filePath) => {
    if (filePath.startsWith('/')) {
        filePath = filePath.substr(1);
    }

    fs.unlink(filePath, err => {
        if (err) {
            throw (err);
        }
    });
};