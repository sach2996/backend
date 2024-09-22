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
        { user: user._id, friend: friendUser._id },
        { user: friendUser._id, friend: user._id },
      ],
    });
    if (existingFriend) {
      return res.status(409).json({ message: "Friendship already exists" });
    }

    // Create new friendship
    const newFriend = new Friend({
      user: user._id,
      friend: friendUser._id,
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
      $or: [{ user: user._id }, { friend: user._id }],
    }).lean();

    if (friendsResponse.length === 0) {
      return res.status(404).json({ message: "No friends exist" });
    }

    // Create an array of friend IDs to fetch their details
    const friendIds = friendsResponse.map((friend) =>
      friend.user.equals(user._id) ? friend.friend : friend.user
    );

    const friendsDetails = await User.find({ _id: { $in: friendIds } }).lean();

    const friends = friendsDetails.map((friend) => ({
      username: friend.username,
      email: friend.email,
      firstname: friend.firstname,
      lastname: friend.lastname,
    }));

    return res.status(200).json({ username: username, friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = friendsRouter;
