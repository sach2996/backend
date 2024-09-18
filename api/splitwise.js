// splitwise.js

const express = require("express");
const { transaction, share } = require("./db");

const splitRouter = express.Router();

splitRouter.get("/transaction", (req, res) => {
  console.log("Reached Splitwise Route"); // Add this log to check if the route is reached
  res.send("Splitwise Route");
});

// POST endpoint to handle the payload
splitRouter.post("/transaction", async (req, res) => {
  const { username, email, description, currency, amount, date, shares } =
    req.body;

  try {
    // Step 1: Create and save the transaction
    const newTransaction = new transaction({
      username: username,
      email: email,
      description,
      currency,
      amount,
      date,
    });

    const transactionResponse = await newTransaction.save();

    // Step 2: Create and save the shares linked to this transaction
    const shareDocuments = shares.map((share) => ({
      transaction_id: transactionResponse._id,
      username: share.username,
      email: share.email,
      group_id: share.group_id,
      owed: share.owed,
      paid: share.paid,
      input: share.input,
      calculated_amount: share.calculated_amount,
    }));
    await share.insertMany(shareDocuments);

    // Step 3: Respond with the created transaction and shares
    res.status(201).json({
      message: "Transaction and shares created successfully",
      expense: transactionResponse,
      shares: shareDocuments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create transaction and shares" });
  }
});

splitRouter.get("/transaction/:username", async (req, res) => {
  const { username } = req.params;

  try {
    let transactions = [];
    const transactionResponse = await transaction.find({ username: username });
    if (!transactionResponse) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    for (let transaction of transactionResponse) {
      const result = await share.find({
        transaction_id: transaction._id,
      });
      transactions.push({ transaction: transaction, shares: result });
    }

    const balance = calculateBalance(transactions, username);
    const owed = calculateOwed(transactions, username);
    const paid = calculatePaid(transactions, username);

    res.status(200).json({
      username: username,
      email: transactionResponse[0].email,
      balance: balance,
      owed: owed,
      paid: paid,
      transactions: transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch transaction and shares" });
  }
});

function calculateBalance(transactions, username) {
  let totalPaid = 0;
  let totalOwed = 0;

  for (const transaction of transactions) {
    const shares = transaction.shares;
    for (const share of shares) {
      if (share.username === username) {
        totalPaid += share.paid;
        totalOwed += share.owed;
      }
    }
  }

  return totalPaid - totalOwed;
}

function calculateOwed(transactions, username) {
  let totalOwed = 0;

  for (const transaction of transactions) {
    const shares = transaction.shares;
    for (const share of shares) {
      if (share.username === username) {
        totalOwed += share.owed;
      }
    }
  }

  return totalOwed;
}

function calculatePaid(transactions, username) {
  let totalPaid = 0;

  for (const transaction of transactions) {
    const shares = transaction.shares;
    for (const share of shares) {
      if (share.username === username) {
        totalPaid += share.paid;
      }
    }
  }

  return totalPaid;
}
module.exports = splitRouter;
