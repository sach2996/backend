const User = require("../models/users");
const { Share } = require("../models/transactions");
const Friend = require("../models/friends"); // Assuming you have a Friend model
const getBalance = async (username) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    // Step 1: Find all shares involving this user
    const shares = await Share.find({ username }).populate("transaction_id");

    // Step 2: Find all friends of the user
    const friends = await Friend.find({
      $or: [{ user: user.username }, { friend: user.username }],
    }).lean();
    const friendsUsernames = friends.map((f) => {
      return f.friend === username ? f.user : f.friend;
    });

    // Step 3: Map to hold balances against each user and group
    const balancesMap = {}; // Map for accumulating balances by user
    const groupBalancesMap = {}; // Map for accumulating balances by group
    const friendsBalancesMap = {}; // Map for accumulating balances by friend

    // Step 4: Loop through all shares to calculate balances
    for (const share of shares) {
      const { transaction_id, ownShare, paid } = share;
      const { username: otherUser, groupName } = transaction_id;

      // Calculate balance for this transaction
      const balance = paid - ownShare;

      // Determine if we should use `groupName` or friend's username
      const groupOrFriend = groupName || otherUser;

      // Update user balance
      if (!balancesMap[otherUser]) {
        balancesMap[otherUser] = {
          username: otherUser,
          balanceTotal: 0,
          groups: {},
        };
      }
      balancesMap[otherUser].balanceTotal += balance;

      // Update group or friend balance
      if (!balancesMap[otherUser].groups[groupOrFriend]) {
        balancesMap[otherUser].groups[groupOrFriend] = 0;
      }
      balancesMap[otherUser].groups[groupOrFriend] += balance;

      // Update overall group/friend balance map
      if (!groupBalancesMap[groupOrFriend]) {
        groupBalancesMap[groupOrFriend] = 0;
      }
      groupBalancesMap[groupOrFriend] += balance;

      // Update friend balance if not a group transaction
      if (!groupName && friendsUsernames.includes(otherUser)) {
        if (!friendsBalancesMap[otherUser]) {
          friendsBalancesMap[otherUser] = 0;
        }
        friendsBalancesMap[otherUser] += balance;
      }
    }

    // Step 5: Construct friend balance response
    const friendBalances = Object.keys(friendsBalancesMap).map((friend) => ({
      username: friend,
      balance: friendsBalancesMap[friend],
    }));

    // Step 6: Construct group balance response
    const groupBalances = Object.keys(groupBalancesMap).map((group) => ({
      groupName: group,
      balance: groupBalancesMap[group],
    }));

    // Step 7: Transform the map into an array response
    const balances = Object.values(balancesMap).map((entry) => ({
      username: entry.username,
      balanceTotal: entry.balanceTotal,
      groups: Object.keys(entry.groups).map((group) => ({
        groupName: group,
        balance: entry.groups[group],
      })),
    }));

    // Step 8: Construct the final response
    const response = {
      username: user.username,
      balances,
      groupTotals: groupBalances,
      friendTotals: friendBalances,
    };

    return response; // Returning the first and only match (current user)
  } catch (error) {
    console.error("Error fetching balance response:", error);
    throw new Error("Failed to get balance response");
  }
};

module.exports = { getBalance };
