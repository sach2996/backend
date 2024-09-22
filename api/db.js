const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
// eslint-disable-next-line no-undef
const connectionString = process.env.CONNECTION_STRING;
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt

const User = mongoose.model("User", userSchema);

// Define Friend Schema
const friendSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true }, // User who has the friend
    friend: {
      type: String,
      ref: "User",
      required: true,
    }, // Friend user reference
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],
  },
  { timestamps: true }
);

const Friend = mongoose.model("Friend", friendSchema);

// Define Group Schema
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

// Define Transaction Schema
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

// Export Models
module.exports = {
  User,
  Transaction,
  Share,
  Friend,
  Group,
};
