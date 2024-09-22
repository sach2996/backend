const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    username: { type: String, ref: "User", required: true }, // Link to user who created the transaction
    description: String,
    currency: String,
    amount: Number,
    groupName: { type: String, ref: "Group" }, // Link to the group
    date: Date,
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

// Define Shares Schema
const shareSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    username: { type: String, ref: "User", required: true }, // Link to user who shares the expense
    groupName: { type: String, ref: "Group" },
    ownShare: Number,
    paid: Number,
    input: mongoose.Schema.Types.Mixed, // For any additional data
  },
  { timestamps: true }
);
const Share = mongoose.model("Share", shareSchema);

module.exports = { Transaction, Share };
