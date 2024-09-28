const Friend = require("../models/friends");
const User = require("../models/users");
const Group = require("../models/groups");
const { Share } = require("../models/transactions");

const balanceService = require("../services/balance.service");
const addFriend = async (friendId, username) => {
  if (friendId === username) {
    throw new Error("You cannot add yourself as a friend");
  }
  const user = await User.findOne({ username });
  const friendUser = await User.findOne({ username: friendId });

  if (!user || !friendUser) {
    throw new Error("User or friend not found");
  }
  if (!friendUser) {
    throw new Error("No user found with the given friendId");
  } // Create and save the group
  const existingFriend = await Friend.findOne({
    $or: [
      { user: user.username, friend: friendUser.username },
      { user: friendUser.username, friend: user.username },
    ],
  });
  if (existingFriend) {
    throw new Error("Friendship already exists");
  }

  // Create new friendship
  const newFriend = new Friend({
    user: user.username,
    friend: friendUser.username,
  });
  return await newFriend.save();
};

const getFriends = async (username) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error("User not found");
  }

  const friendsResponse = await Friend.find({
    $or: [{ user: user.username }, { friend: user.username }],
  }).lean();

  if (friendsResponse.length === 0) {
    throw new Error("No friends exist");
  }

  const friendIds = friendsResponse.map(
    (friend) => {
      if (friend.user === username) {
        return friend.friend;
      }
      return friend.user;
    }

    // friend.user.equals(user.username) ? friend.friend : friend.user
  );

  const friendsDetails = await User.find({
    username: { $in: friendIds },
  }).lean();

  let friends = [];
  for (const friend of friendsDetails) {
    for (const item of friendsResponse) {
      const groupsResponse = await Group.find({
        users: { $all: [item.user, item.friend] },
      });
      const modifiedResponse = await calculateGroupWiseBalance(groupsResponse);
      // const modifiedResponse = groupsResponse.map((group) => {
      //   return {
      //     groupName: group.groupName,
      //     balance: 0, // Default to 0 if no balance is found
      //   };
      // });
      if (item.user === friend.username || item.friend === friend.username)
        friends.push({
          username: friend.username,
          email: friend.email,
          firstname: friend.firstname,
          lastname: friend.lastname,
          transactions: item.transactions,
          groups: modifiedResponse,
        });
    }
  }

  const friendsBalance = await balanceService.calculateIndividualBalance(
    username
  );
  for (const friend of friends) {
    for (const item of friendsBalance) {
      if (item.username === friend.username) {
        friend.balance = item.balance;
      }
    }
  }

  return { username: username, friends };
};

async function calculateGroupWiseBalance(groups) {
  // const modifiedResponse = groupsResponse.map((group) => {
  //   return {
  //     groupName: group.groupName,
  //     balance: 0, // Default to 0 if no balance is found
  //   };
  // });

  const balancesMap = {}; // To track overall balances by friend
  const individualBalancesMap = {}; // To track individual transaction balances by friend

  // Step 4: Loop through each friend and calculate balances
  for (const group of groups) {
    const groupName = group.groupName;

    // Initialize balance for this friend if not already present
    if (!balancesMap[groupName]) {
      balancesMap[groupName] = 0;
    }

    // Step 5: Loop through each transaction and calculate balance
    for (const transaction of group.transactions) {
      const shares = await Share.find({
        transaction_id: transaction,
        groupName: groupName,
      });

      // Step 6: Calculate balance from each share in this transaction
      for (const share of shares) {
        const { username: shareUser, ownShare, paid } = share;
        if (paid > 0) {
          // Calculate balance for this transaction (amount paid minus own share)
          const balance = paid - ownShare;

          if (balance >= 0) {
            if (!individualBalancesMap[groupName]) {
              individualBalancesMap[groupName] = 0;
            }

            if (shareUser === groupName) {
              individualBalancesMap[groupName] += balance;
            } else {
              individualBalancesMap[groupName] -= balance;
            }
            // Update overall balance for this friend
            if (shareUser === groupName) {
              balancesMap[groupName] = balance;
            } else {
              balancesMap[groupName] = balance;
            }
          }
        }
      }
    }
  }
  const response = Object.keys(balancesMap).map((groupName) => ({
    groupName: groupName,
    balance: -balancesMap[groupName], //fix this hard coded value later
  }));

  return response; // Return the balance with each friend
}

module.exports = { addFriend, getFriends };
