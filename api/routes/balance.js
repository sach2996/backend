// routes/groupRoutes.js
const express = require("express");
const { getBalance } = require("../controller/balance.controller");

const balanceRouter = express.Router();

balanceRouter.get("/", getBalance);

module.exports = balanceRouter;
