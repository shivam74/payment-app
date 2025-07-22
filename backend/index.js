const express = require("express");
const mainRouter = require('./routes/index')
const cors = require('cors');
const jwt = require("jsonwebtoken")
const morgan = require('morgan');
const { authRateLimiter } = require('./middleware');

const app = express();

// Restrict CORS to frontend origin in production
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());
app.use(morgan('dev'));

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect('https://' + req.headers.host + req.url);
        }
        next();
    });
}

// Rate limit auth endpoints
app.use('/api/v1/user', authRateLimiter);

app.use("/api/v1", mainRouter);

// Global error handler (fallback)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});