const mongoose = require("mongoose");
const { string } = require("zod");
require("dotenv").config();

// eslint-disable-next-line no-undef
const connectionString = process.env.CONNECTION_STRING;

mongoose.connect(connectionString);

// const todoSchema = mongoose.Schema({
//   title: String,
//   description: String,
//   completed: Boolean,
// });

// const todo = mongoose.model("todos", todoSchema);

// Define Transaction Schema
const transactionSchema = new mongoose.Schema({
  username: String,
  email: String,
  firstname: String,
  lastname: String,
  description: String,
  currency: String,
  amount: Number,
  group_id: String,
  date: Date,
});

// Define Shares Schema
const shareSchema = new mongoose.Schema({
  transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  username: String,
  email: String,
  firstname: String,
  lastname: String,
  group_id: String,
  debit: Number,
  credit: Number,
  paid: Number,
  input: mongoose.Schema.Types.Mixed, // 'input' can be any type, hence 'Mixed'
});

// Create Models
const transaction = mongoose.model("Transaction", transactionSchema);
const share = mongoose.model("Share", shareSchema);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

module.exports = {
  transaction,
  share,
  User,
};
