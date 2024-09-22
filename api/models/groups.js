const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, unique: true },
    description: { type: String },
    users: [{ type: String, ref: "User" }], // Array of users in the group
    isPublic: { type: Boolean, default: true },
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    settings: {
      visibility: {
        type: String,
        enum: ["public", "private"],
        default: "private",
      },
      notifications: { type: Boolean, default: true },
    },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
