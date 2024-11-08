const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    // Retrieve the token from the request headers (commonly named as Authorization or a custom header)
    const token = req.headers['access-token'];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the JWT token using the secret key
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Attach the decoded user information to the request object for further usage
        req.user = decoded;
        next();
    });
}

module.exports = authenticateToken;
