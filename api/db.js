const mongoose = require("mongoose");
require("dotenv").config();

// eslint-disable-next-line no-undef
const connectionString = process.env.CONNECTION_STRING;

mongoose.connect(connectionString);

const todoSchema = mongoose.Schema({
  title: String,
  description: String,
  completed: Boolean,
});

const todo = mongoose.model("todos", todoSchema);

// Define Transaction Schema
const transactionSchema = new mongoose.Schema({
  description: String,
  currency: String,
  amount: Number,
  date: Date,
});

// Define Shares Schema
const shareSchema = new mongoose.Schema({
  transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  user_id: Number,
  owed: Number,
  paid: Number,
  input: mongoose.Schema.Types.Mixed, // 'input' can be any type, hence 'Mixed'
  calculated_amount: Number,
});

// Create Models
const transaction = mongoose.model("Transaction", transactionSchema);
const share = mongoose.model("Share", shareSchema);

module.exports = {
  todo,
  transaction,
  share,
};
