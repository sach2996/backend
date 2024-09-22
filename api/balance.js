const express = require("express");
const balanceRouter = express.Router();

const { User, Share } = require("./db"); // Adjust the path as necessary

async function getBalanceResponse(username) {
  try {
    // Step 1: Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error("User not found");
    }

    // Step 2: Aggregate data
    const userId = user._id;

    const balances = await Share.aggregate([
      { $match: { user: userId } }, // Filter by user
      {
        $lookup: {
          from: "transactions", // Collection name
          localField: "transaction_id",
          foreignField: "_id",
          as: "transaction",
        },
      },
      { $unwind: "$transaction" },
      {
        $lookup: {
          from: "groups",
          localField: "transaction.groupName",
          foreignField: "groupName",
          as: "group",
        },
      },
      { $unwind: "$group" },
      {
        $group: {
          _id: {
            user: "$user",
            groupName: "$group.groupName",
          },
          balance: {
            $sum: {
              $subtract: ["$paid", "$owed"],
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.user",
          balances: {
            $push: {
              groupName: "$_id.groupName",
              balance: "$balance",
            },
          },
          balanceTotal: {
            $sum: "$balance",
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          username: "$user.username",
          balances: 1,
          balanceTotal: 1,
        },
      },
    ]);

    return balances[0]; // Returning the first and only match (current user)
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get balance response");
  }
}

// Express Route Example
balanceRouter.get("/", async (req, res) => {
  const username = req.body.username;
  try {
    const balanceResponse = await getBalanceResponse(username);
    res.status(200).json(balanceResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = balanceRouter;
