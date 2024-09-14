const mongoose = require("mongoose");
require("dotenv").config();

const connectionString = process.env.CONNECTION_STRING;

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
