const express = require("express");
const { createTodo, updateTodo } = require("../types");
const { todo } = require("./db");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.post("/todo", async (req, res) => {
  const reqPayload = req.body;
  const parsePayload = createTodo.safeParse(reqPayload);
  if (!parsePayload.success) {
    res.status(411).json({
      error: "Please pass valid input",
    });
    return;
  }
  await todo.create({
    title: parsePayload.data.title,
    description: parsePayload.data.description,
    completed: false,
  });
  res.status(201).json({
    message: "Todo Created Successfully",
  });
});

app.get("/todos", async (req, res) => {
  const result = await todo.find({});
  res.status(200).json(result);
});

app.put("/completed", async (req, res) => {
  const reqPayload = req.body;
  const parsePayload = updateTodo.safeParse(reqPayload);
  if (!parsePayload.success) {
    res.status(411).json({
      error: "Please pass valid id",
    });
    return;
  }

  await todo.updateOne(
    { _id: parsePayload.data.id },
    {
      completed: true,
    }
  );

  res.status(200).json({
    message: "Todo completed",
  });
});

app.delete("/todo/:id", async (req, res) => {
  const id = req.params.id;

  const result = await todo.findOneAndDelete({ _id: id });

  res.status(200).json(result);
});

app.listen(3000, () => {
  console.log("Server is running on port: 3000");
});

module.exports = app;
