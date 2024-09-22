const Friend = require("../models/friends");
const User = require("../models/users");

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

  let friends = friendsDetails.map((friend) => {
    for (const item of friendsResponse) {
      if (item.user === friend.username || item.friend === friend.username)
        return {
          username: friend.username,
          email: friend.email,
          firstname: friend.firstname,
          lastname: friend.lastname,
          transactions: item.transactions,
        };
    }
  });

  return { username: username, friends };
};
module.exports = { addFriend, getFriends };
