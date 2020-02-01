exports.get404 = (req, res, next) => {
    return res.render('404', { pageTitle: 'Page not found', path: '/404', isAuthenticated: req.session.isAuthenticated });
};

exports.get500 = (req, res, next) => {
    return res.render('500', { pageTitle: '500 - Error!', path: '/500', isAuthenticated: req.session.isAuthenticated });
};