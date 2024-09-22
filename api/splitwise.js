// splitwise.js

const express = require("express");
const { Transaction, Share, Group, Friend } = require("./db");

const splitRouter = express.Router();

splitRouter.get("/transaction", (req, res) => {
  console.log("Reached Splitwise Route"); // Add this log to check if the route is reached
  res.send("Splitwise Route");
});

// POST endpoint to handle the payload
splitRouter.post("/transaction/group", async (req, res) => {
  const { username, description, currency, amount, date, groupName, shares } =
    req.body;

  try {
    // Step 1: Create and save the transaction
    const newTransaction = new Transaction({
      username: username,
      description,
      currency,
      amount,
      date,
      groupName,
    });

    const transactionResponse = await newTransaction.save();

    const groupUpdateResponse = await Group.findOneAndUpdate(
      { groupName: groupName },
      { $push: { transactions: transactionResponse._id } }
    );

    if (!groupUpdateResponse) {
      return res.status(500).json({
        message: "Some error occurred",
      });
    }

    for (let share of shares) {
      if (share.username != username) {
        const friendRecord = await Friend.findOneAndUpdate(
          {
            $or: [
              { user: share.username, friend: username },
              { user: username, friend: share.username },
            ],
          },
          { $push: { transactions: transactionResponse._id } }
        );

        if (!friendRecord) {
          return res.status(500).json({
            message: "Some error occurred",
          });
        }
      }
    }

    // Step 2: Create and save the shares linked to this transaction
    const shareDocuments = shares.map((share) => ({
      transaction_id: transactionResponse._id,
      username: share.username,
      groupName: share.groupName,
      ownShare: share.ownShare,
      paid: share.paid,
      input: share.input,
    }));
    await Share.insertMany(shareDocuments);

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
splitRouter.post("/transaction/friend", async (req, res) => {
  const { username, description, currency, amount, date, shares } = req.body;

  try {
    // Step 1: Create and save the transaction
    const newTransaction = new Transaction({
      username: username,
      description,
      currency,
      amount,
      date,
      groupName: null,
    });

    const transactionResponse = await newTransaction.save();

    for (let share of shares) {
      if (share.username != username) {
        const friendRecord = await Friend.findOneAndUpdate(
          {
            $or: [
              { user: share.username, friend: username },
              { user: username, friend: share.username },
            ],
          },
          { $push: { transactions: transactionResponse._id } }
        );
        console.log(friendRecord);
        if (!friendRecord) {
          return res.status(500).json({
            message: "Some error occurred",
          });
        }
      }
    }
    // Step 2: Create and save the shares linked to this transaction
    const shareDocuments = shares.map((share) => ({
      transaction_id: transactionResponse._id,
      username: share.username,
      groupName: null,
      ownShare: share.ownShare,
      paid: share.paid,
      input: share.input,
    }));
    await Share.insertMany(shareDocuments);

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
    const transactionResponse = await Transaction.find({ username: username });
    if (!transactionResponse) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    for (let transaction of transactionResponse) {
      const result = await Share.find({
        transaction_id: transaction._id,
      });
      transactions.push({ transaction: transaction, shares: result });
    }

    const { totalOwe, totalReceive, totalPaid } = calculateOweAndReceive(
      transactions,
      username
    );

    res.status(200).json({
      username: username,
      email: transactionResponse[0].email,
      firstname: transactionResponse[0].firstname,
      lastname: transactionResponse[0].lastname,
      owe: totalOwe,
      receive: totalReceive,
      balance: totalReceive + totalOwe,
      paid: totalPaid,
      transactions: transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch transaction and shares" });
  }
});

function calculateOweAndReceive(transactions, username) {
  // let totalPaid = 0;
  let totalOwe = 0;
  let totalReceive = 0;
  let totalOwnShare = 0;
  let totalPaid = 0;

  for (const transaction of transactions) {
    const shares = transaction.shares;
    for (const share of shares) {
      if (share.username === username) {
        totalOwnShare += share.ownShare;
        totalPaid += share.paid;
      }
    }
  }

  const result = totalPaid - totalOwnShare;
  if (result > 0) {
    totalReceive = result;
  } else if (result < 0) {
    totalOwe = result;
  }

  return { totalOwe, totalReceive, totalPaid };
}

// function calculateReceive(transactions, username) {
//   let totalGetBack = 0;

//   for (const transaction of transactions) {
//     const shares = transaction.shares;
//     for (const share of shares) {
//       if (share.username === username) {
//         totalGetBack += share.debit;
//       }
//     }
//   }

//   return totalGetBack;
// }

// function calculatePaid(transactions, username) {
//   let totalPaid = 0;

//   for (const transaction of transactions) {
//     const shares = transaction.shares;
//     for (const share of shares) {
//       if (share.username === username) {
//         totalPaid += share.paid;
//       }
//     }
//   }

//   return totalPaid;
// }
module.exports = splitRouter;
