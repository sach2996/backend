// routes/groupRoutes.js
const express = require("express");
const {
  addGroupTransaction,
  addFriendTransaction,
  getUserTransaction,
} = require("../controller/transactions.controller");

const transactionsRouter = express.Router();

transactionsRouter.post("/group", addGroupTransaction);
transactionsRouter.post("/friend", addFriendTransaction);
transactionsRouter.get("/:username", getUserTransaction);

transactionsRouter.post("/group/settleup", addGroupTransaction);
transactionsRouter.post("/friend/settleup", addFriendTransaction);

module.exports = transactionsRouter;
