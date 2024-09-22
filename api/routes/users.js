// routes/groupRoutes.js
const express = require("express");
const { registerUser, loginUser } = require("../controller/users.contoller");

const { body } = require("express-validator");

const usersRouter = express.Router();

usersRouter.post(
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
  registerUser
);
usersRouter.post(
  "/login",
  [
    body("username", "Username is required").not().isEmpty(),
    body("password", "Password is required").exists(),
  ],
  loginUser
);

module.exports = usersRouter;
