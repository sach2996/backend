const mongoose = require("mongoose");
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
  groupName: String,
  date: Date,
});

// Define Shares Schema
const shareSchema = new mongoose.Schema({
  transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  username: String,
  email: String,
  firstname: String,
  lastname: String,
  groupName: String,
  debit: Number,
  credit: Number,
  paid: Number,
  input: mongoose.Schema.Types.Mixed, // 'input' can be any type, hence 'Mixed'
});

const friendSchema = new mongoose.Schema({
  // username: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // friend: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  user: { type: String, required: true },
  friend: { type: String, required: true },
});

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true, unique: true },
  description: String,
  users: [{ type: String, required: true, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isPublic: { type: Boolean, default: true },
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  settings: {
    // Group-specific settings
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    notifications: { type: Boolean, default: true },
  },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
});

// Create Models
const transaction = mongoose.model("Transaction", transactionSchema);
const share = mongoose.model("Share", shareSchema);
const Friend = mongoose.model("Friend", friendSchema);
const Group = mongoose.model("Group", groupSchema);

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
  Friend,
  Group,
};
