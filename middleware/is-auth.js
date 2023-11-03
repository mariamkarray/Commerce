module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn)
        return res.redirect('/login');
    // the next middleware would be called (the controller function in router.get())
    next();
}
