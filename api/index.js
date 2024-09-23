const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const { authMiddleware } = require("./auth.js");
const app = express();
const cors = require("cors");
const usersRoutes = require("./routes/users.js");
const friendsRoutes = require("./routes/friends.js");
const groupsRoutes = require("./routes/groups.js");
const transactionsRoutes = require("./routes/transactions.js");

const balanceRoutes = require("./routes/balance.js");

// eslint-disable-next-line no-undef
const connectionString = process.env.CONNECTION_STRING;
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

app.use("/api/auth", usersRoutes);

app.use("/api/transaction", authMiddleware, transactionsRoutes);

app.use("/api/friend", authMiddleware, friendsRoutes);
app.use("/api/group", authMiddleware, groupsRoutes);
app.use("/api/balance", authMiddleware, balanceRoutes);

// Remove the app.listen(3000) line; not needed in serverless environment
app.listen(3000, () => {
  console.log("Server is running on port: 3000");
});

// Export the app for Vercel to handle as a serverless function
module.exports = (req, res) => {
  return app(req, res);
};
