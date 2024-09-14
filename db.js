const mongoose = require("mongoose");
const { boolean } = require("zod");
require("dotenv").config();

const connectionString = process.env.CONNECTION_STRING;
console.log("**** ", connectionString);

mongoose.connect(connectionString);

const todoSchema = mongoose.Schema({
  title: String,
  description: String,
  completed: Boolean,
});

const todo = mongoose.model("todos", todoSchema);

module.exports = {
  todo,
};
