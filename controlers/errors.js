exports.get404 = (req, res, next) => {
    return res.render('404', { pageTitle: 'Page not found', path: undefined, isAuthenticated: req.session.isAuthenticated });
};