const User = require("../models/users");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");

// eslint-disable-next-line no-undef
const JWT_SECRET = process.env.JWT_SECRET;
const registerUser = async (email, username, password, firstname, lastname) => {
  // Check if username already exists
  let user = await User.findOne({ username });
  if (user) {
    throw new Error("Username already exists");
  }

  // Check if email already exists
  user = await User.findOne({ email });
  if (user) {
    throw new Error("Email already exists");
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user instance
  user = new User({
    email,
    username,
    password: hashedPassword,
    firstname,
    lastname,
  });

  // Save the user to the database
  await user.save();

  // Create JWT payload
  const payload = {
    user: {
      id: user._id, // Include user ID for further use
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    },
  };

  // Sign the JWT token
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    return { token, user: payload.user };
  } catch (error) {
    throw new Error("Error generating token", error);
  }
};

const loginUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
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

  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    return { token, user: payload.user };
  } catch (error) {
    throw new Error("Error generating token", error);
  }
};

module.exports = { registerUser, loginUser };
