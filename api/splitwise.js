// splitwise.js

const express = require("express");
const { transaction, share } = require("./db");

const router = express.Router();

// POST endpoint to handle the payload
router.post("/transaction", async (req, res) => {
  const { description, currency, amount, date, shares } = req.body;

  try {
    // Step 1: Create and save the transaction
    const newTransaction = new transaction({
      description,
      currency,
      amount,
      date,
    });
    const transactionResponse = await newTransaction.save();

    // Step 2: Create and save the shares linked to this transaction
    const shareDocuments = shares.map((share) => ({
      transaction_id: transactionResponse._id,
      user_id: share.user_id,
      owed: share.owed,
      paid: share.paid,
      input: share.input,
      calculated_amount: share.calculated_amount,
    }));
    await share.insertMany(shareDocuments);

    // Step 3: Respond with the created transaction and shares
    res.status(201).json({
      message: "Transaction and shares created successfully",
      transactionResponse,
      shares: shareDocuments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create transaction and shares" });
  }
});

module.exports = router;
