const User = require("../models/users");
const { Share } = require("../models/transactions");
const Friend = require("../models/friends"); // Assuming you have a Friend model
const getBalance = async (username) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    const friends = await calculateIndividualBalance(username);

    const balances = await calculateGroupBalance(username);

    return {
      username: balances.username,
      balanceTotal: balances.balanceTotal,
      groups: balances.groups,
      friends,
    }; // Returning the first and only match (current user)
  } catch (error) {
    console.error("Error fetching balance response:", error);
    throw new Error("Failed to get balance response");
  }
};

async function calculateIndividualBalance(username) {
  // Step 1: Fetch all friends of the user
  const friends = await Friend.find({
    $or: [{ user: username }, { friend: username }],
  }).lean();

  // Step 2: Map each friend to their username and transactions
  const friendsList = friends.map((f) => {
    const friendUsername = f.friend === username ? f.user : f.friend;
    return { username: friendUsername, transactions: f.transactions };
  });

  // Step 3: Maps to accumulate balances
  const balancesMap = {}; // To track overall balances by friend
  const individualBalancesMap = {}; // To track individual transaction balances by friend

  // Step 4: Loop through each friend and calculate balances
  for (const friend of friendsList) {
    const friendUsername = friend.username;

    // Initialize balance for this friend if not already present
    if (!balancesMap[friendUsername]) {
      balancesMap[friendUsername] = 0;
    }

    // Step 5: Loop through each transaction and calculate balance
    for (const transaction of friend.transactions) {
      const shares = await Share.find({ transaction_id: transaction });

      // Step 6: Calculate balance from each share in this transaction
      for (const share of shares) {
        const { username: shareUser, ownShare, paid } = share;
        if (paid > 0) {
          // Calculate balance for this transaction (amount paid minus own share)
          const balance = paid - ownShare;

          if (balance >= 0) {
            if (!individualBalancesMap[friendUsername]) {
              individualBalancesMap[friendUsername] = 0;
            }

            if (shareUser === friendUsername) {
              individualBalancesMap[friendUsername] += balance;
            } else {
              individualBalancesMap[friendUsername] -= balance;
            }
            // Update overall balance for this friend
            if (shareUser === friendUsername) {
              balancesMap[friendUsername] += balance;
            } else {
              balancesMap[friendUsername] -= balance;
            }
          }
        }
      }
    }
  }
  const response = Object.keys(balancesMap).map((friendUsername) => ({
    username: friendUsername,
    balance: -balancesMap[friendUsername], //fix this hard coded value later
  }));

  return response; // Return the balance with each friend
}

async function calculateGroupBalance(username) {
  const shares = await Share.find({ username }).populate("transaction_id");

  // Step 3: Map to hold balances against each user and group
  const balancesMap = {}; // Map for accumulating balances by user
  const groupBalancesMap = {}; // Map for accumulating balances by group

  // Step 4: Loop through all shares to calculate balances
  for (const share of shares) {
    const { transaction_id, ownShare, paid } = share;
    const { username: otherUser, groupName } = transaction_id;

    // Calculate balance for this transaction
    const balance = paid - ownShare;

    // Update user balance
    if (!balancesMap[otherUser]) {
      balancesMap[otherUser] = {
        username: otherUser,
        balanceTotal: 0,
        groups: {},
      };
    }
    balancesMap[otherUser].balanceTotal += balance;

    // Update group balance
    if (!balancesMap[otherUser].groups[groupName]) {
      balancesMap[otherUser].groups[groupName] = 0;
    }
    balancesMap[otherUser].groups[groupName] += balance;

    // Update overall group balance map
    if (!groupBalancesMap[groupName]) {
      groupBalancesMap[groupName] = 0;
    }
    groupBalancesMap[groupName] += balance;
  }

  // Step 5: Transform the map into an array response
  const balances = Object.values(balancesMap).map((entry) => ({
    username: entry.username,
    balanceTotal: entry.balanceTotal,
    groups: Object.keys(entry.groups).map((group) => ({
      groupName: group,
      balance: entry.groups[group],
    })),
  }));
  return balances[0];
}

module.exports = {
  getBalance,
  calculateIndividualBalance,
  calculateGroupBalance,
};
