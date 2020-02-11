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

exports.generatePaginationData = (page, pageSize, total) => {
    return {
        currentPage: page,
        hasNext: pageSize * page < total,
        hasPrevious: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(total / pageSize)
    };
};