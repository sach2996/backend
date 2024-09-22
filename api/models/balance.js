const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true },
    friend: {
      type: String,
      ref: "User",
      required: true,
    },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],
  },
  { timestamps: true }
);

const Friend = mongoose.model("Friend", friendSchema);

module.exports = Friend;
