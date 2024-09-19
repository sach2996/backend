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
  const {
    username,
    email,
    firstname,
    lastname,
    description,
    currency,
    amount,
    date,
    shares,
  } = req.body;

  try {
    // Step 1: Create and save the transaction
    const newTransaction = new transaction({
      username: username,
      email: email,
      firstname,
      lastname,
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
      firstname: share.firstname,
      lastname: share.lastname,
      group_id: share.group_id,
      debit: share.debit,
      credit: share.credit,
      paid: share.paid,
      input: share.input,
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

    const credit = calculateCredit(transactions, username);
    const debit = calculateDebit(transactions, username);
    const paid = calculatePaid(transactions, username);

    res.status(200).json({
      username: username,
      email: transactionResponse[0].email,
      firstname: transactionResponse[0].firstname,
      lastname: transactionResponse[0].lastname,
      credit: credit,
      debit: debit,
      balance: debit - credit,
      paid: paid,
      transactions: transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch transaction and shares" });
  }
});

function calculateCredit(transactions, username) {
  // let totalPaid = 0;
  let totalOwe = 0;

  for (const transaction of transactions) {
    const shares = transaction.shares;
    for (const share of shares) {
      if (share.username === username && share.paid === 0) {
        // totalPaid += share.paid;
        totalOwe += share.credit;
      }
    }
  }

  return totalOwe;
}

function calculateDebit(transactions, username) {
  let totalGetBack = 0;

  for (const transaction of transactions) {
    const shares = transaction.shares;
    for (const share of shares) {
      if (share.username === username) {
        totalGetBack += share.debit;
      }
    }
  }

  return totalGetBack;
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
