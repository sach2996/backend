const transactionsService = require("../services/transactions.service");

const addGroupTransaction = async (req, res) => {
  const { username, description, currency, amount, date, groupName, shares } =
    req.body;

  try {
    const transaction = await transactionsService.addGroupTransaction(
      username,
      description,
      currency,
      amount,
      date,
      groupName,
      shares
    );
    res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const addFriendTransaction = async (req, res) => {
  const { username, description, currency, amount, date, shares } = req.body;

  try {
    const transaction = await transactionsService.addFriendTransaction(
      username,
      description,
      currency,
      amount,
      date,
      shares
    );
    res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const getUserTransaction = async (req, res) => {
  const { username } = req.params; // Use req.query instead of req.body for GET

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const transactions = await transactionsService.getUserTransaction(username);
    res.status(200).json({
      message: "Transaction details retrieved successfully",
      transactions,
    });
  } catch (error) {
    console.error("Error getting friends info:", error.message);
    res.status(400).json({ message: error.message });
  }
};
module.exports = {
  addGroupTransaction,
  addFriendTransaction,
  getUserTransaction,
};
