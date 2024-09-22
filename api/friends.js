const express = require("express");
const friendsRouter = express.Router();
const { Friend, User } = require("./db");

// const bodyParser = require("body-parser");
friendsRouter.post("/", async (req, res) => {
  const { friendId, username } = req.body;

  // Validate required fields
  if (!friendId || !username) {
    return res
      .status(400)
      .json({ message: "Missing required fields: friendId or username" });
  }

  // Check if the user is trying to add themselves as a friend
  if (friendId === username) {
    return res
      .status(400)
      .json({ message: "You cannot add yourself as a friend" });
  }

  try {
    const user = await User.findOne({ username });
    const friendUser = await User.findOne({ username: friendId });

    if (!user || !friendUser) {
      return res.status(404).json({ message: "User or friend not found" });
    }
    if (!friendUser) {
      return res
        .status(404)
        .json({ message: "No user found with the given friendId" });
    }

    // Check if the friendship already exists
    const existingFriend = await Friend.findOne({
      $or: [
        { user: user.username, friend: friendUser.username },
        { user: friendUser.username, friend: user.username },
      ],
    });
    if (existingFriend) {
      return res.status(409).json({ message: "Friendship already exists" });
    }

    // Create new friendship
    const newFriend = new Friend({
      user: user.username,
      friend: friendUser.username,
    });
    await newFriend.save();
    return res.status(201).json({ message: "Friend added successfully" });
  } catch (error) {
    console.error("Error adding friend:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

friendsRouter.get("/", async (req, res) => {
  const username = req.body.username; // Use req.query instead of req.body for GET

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    // Find the user based on the username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendsResponse = await Friend.find({
      $or: [{ user: user.username }, { friend: user.username }],
    }).lean();

    if (friendsResponse.length === 0) {
      return res.status(404).json({ message: "No friends exist" });
    }

    // Create an array of friend IDs to fetch their details
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

    return res.status(200).json({ username: username, friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = friendsRouter;
