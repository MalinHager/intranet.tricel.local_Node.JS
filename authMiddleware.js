// authMiddleware.js

module.exports = function checkAuth(req, res, next) {
    // Vi kollar om det finns ett userId i sessionen
    if (req.session && req.session.userId) {
        // Om användaren är inloggad, låt dem gå vidare till nästa steg (next)
        return next();
    } else {
        // Om de inte är inloggade, skicka dem till inloggningssidan
        res.redirect('/api/login'); 
    }
};