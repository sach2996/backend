const jwt = require("jsonwebtoken");
require("dotenv").config();

// JWT Secret Key
// eslint-disable-next-line no-undef
const JWT_SECRET = process.env.JWT_SECRET; // Make sure to keep this secret and secure

// Middleware to authenticate JWT tokens
const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization").split(" ")[1];

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.body.username = decoded.user.username;
    req.body.email = decoded.user.email;
    req.body.firstname = decoded.user.firstname;
    req.body.lastname = decoded.user.lastname;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid", error: err });
  }
};

module.exports = { authMiddleware };
