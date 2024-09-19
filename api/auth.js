const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const { User } = require("./db");
const router = express.Router();
require("dotenv").config();

// JWT Secret Key
// eslint-disable-next-line no-undef
const JWT_SECRET = process.env.JWT_SECRET; // Make sure to keep this secret and secure

// Register a new user
router.post(
  "/register",
  [
    body("email", "Email id is required").not().isEmpty(),
    body("firstname", "First name is required").not().isEmpty(),
    body("lastname", "Last name is required").not().isEmpty(),
    body("username", "Username is required").not().isEmpty(),
    body("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password, firstname, lastname } = req.body;

    try {
      // Check if the user already exists
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }
      let emailResponse = await User.findOne({ email });
      if (emailResponse) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save the user to the database

      user = new User({
        email,
        username,
        password: hashedPassword,
        firstname,
        lastname,
      });

      await user.save();

      // Create and send a JWT token
      const payload = {
        user: {
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        },
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// User login
router.post(
  "/login",
  [
    body("username", "Username is required").not().isEmpty(),
    body("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if the user exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Create and send a JWT token
      const payload = {
        user: {
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        },
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Middleware to authenticate JWT tokens
const authMiddleware = (req, res, next) => {
  console.log("request reached auth middleware ", req.body, req.header);
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

module.exports = { router, authMiddleware };
