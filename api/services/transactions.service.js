const { Transaction, Share } = require("../models/transactions");
const Group = require("../models/groups");
const Friend = require("../models/friends");

const addGroupTransaction = async (
  username,
  description,
  currency,
  amount,
  date,
  groupName,
  shares
) => {
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
    throw new Error("Some error occurred");
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
        throw new Error("Some error occurred");
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

  return { expense: transactionResponse, shares: shareDocuments };
};
const addFriendTransaction = async (
  username,
  description,
  currency,
  amount,
  date,
  shares
) => {
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
        throw new Error("Some error occurred");
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
  return { expense: transactionResponse, shares: shareDocuments };
};

const getUserTransaction = async (username) => {
  let transactions = [];
  const transactionResponse = await Transaction.find({ username: username });
  if (!transactionResponse) {
    throw new Error("Transaction not found");
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

  return {
    username: username,
    email: transactionResponse[0].email,
    firstname: transactionResponse[0].firstname,
    lastname: transactionResponse[0].lastname,
    owe: totalOwe,
    receive: totalReceive,
    balance: totalReceive + totalOwe,
    paid: totalPaid,
    transactions: transactions,
  };
};

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

module.exports = {
  addGroupTransaction,
  addFriendTransaction,
  getUserTransaction,
};
