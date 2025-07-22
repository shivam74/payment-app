const JWT_SECRET = require("./config")
const jwt = require("jsonwebtoken")
const rateLimit = require('express-rate-limit');

// Auth middleware with generic error messages
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ msg: "Invalid or missing token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.userId) {
            return res.status(403).json({ msg: "Invalid token" });
        }
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({ msg: "Invalid or expired token" });
    }
};

// Rate limiter for authentication endpoints
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { message: "Too many requests, please try again later." }
});

module.exports = {
    authMiddleware,
    authRateLimiter
};