
function requireAuth(req, res, next) {
    if (req.session && req.session.adminId) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in first.'
    });
}

module.exports = requireAuth;
