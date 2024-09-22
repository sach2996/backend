const usersService = require("../services/users.service");
const { validationResult } = require("express-validator");

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, username, password, firstname, lastname } = req.body;

  try {
    const user = await usersService.registerUser(
      email,
      username,
      password,
      firstname,
      lastname
    );
    res.status(201).json({
      message: "User added successfully",
      user,
    });
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const user = await usersService.loginUser(username, password);
    res.status(200).json({
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    console.error("Error during user login:", error.message);
    res.status(400).json({ message: error.message });
  }
};
module.exports = { registerUser, loginUser };
