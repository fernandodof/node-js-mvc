exports.returnError = (next, message = 'An error occured', statusCode = 500) => {
    const error = new (message);
    error.httpStatusCode = statusCode;
    return next(error);
};