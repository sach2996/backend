const express = require("express");
const { createTodo, updateTodo } = require("../types");
const { todo } = require("./db");

const splitwiseRoutes = require("./splitwise");
const { router, authMiddleware } = require("./auth.js");
const app = express();
const cors = require("cors");
const friendsRouter = require("./friends.js");
const groupsRouter = require("./groups.js");
const balanceRouter = require("./balance.js");

app.use(express.json());
app.use(cors());

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  res.send("Hello from Express on Vercel!");
});

app.use("/api/auth", router);

app.use("/api/split", authMiddleware, splitwiseRoutes);

app.use("/api/friend", authMiddleware, friendsRouter);
app.use("/api/group", authMiddleware, groupsRouter);
app.use("/api/balance", authMiddleware, balanceRouter);
app.post("/todo", async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create Todo" });
  }
});

app.get("/todos", async (req, res) => {
  try {
    const result = await todo.find({});
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.put("/completed", async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

app.delete("/todo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await todo.findOneAndDelete({ _id: id });
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Remove the app.listen(3000) line; not needed in serverless environment
app.listen(3000, () => {
  console.log("Server is running on port: 3000");
});

// Export the app for Vercel to handle as a serverless function
module.exports = (req, res) => {
  return app(req, res);
};
