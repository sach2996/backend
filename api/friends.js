const express = require("express");
const friendsRouter = express.Router();
const { Friend, User } = require("./db");

// const bodyParser = require("body-parser");
friendsRouter.post("/", async (req, res) => {
  const { friendId, username } = req.body;

  if (!friendId) {
    return res
      .status(400)
      .json({ message: "Missing required field: friendId" });
  }

  try {
    const userResponse = await User.findOne({ username: friendId });

    if (!userResponse) {
      return res
        .status(404)
        .json({ message: "username not found  for this id" });
    }
  } catch (error) {
    console.error("Error checking friend existence:", error);
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const existingFriend = await Friend.findOne({
      $or: [
        { usern: username, friend: friendId },
        { user: friendId, friend: username },
      ],
    });
    if (existingFriend) {
      return res.status(409).json({ message: "Friendship already exists" });
    }
  } catch (error) {
    console.error("Error checking existing friend:", error);
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const newFriend = new Friend({
      user: username,
      friend: friendId,
    });
    await newFriend.save();
    res.status(201).json({ message: "Friend added successfully" });
  } catch (error) {
    console.error("Error creating friend:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

friendsRouter.get("/", async (req, res) => {
  // const { username } = req.params;

  // if (username != req.body.username) {
  //   return res.status(409).json({
  //     message: "You are not authorized to see other person's friends",
  //   });
  // }

  const username = req.body.username;
  try {
    const friendsResponse = await Friend.find({ user: username });
    if (friendsResponse.length == 0) {
      return res.status(404).json({ message: "No friends exist" });
    }
    let friends = [];
    for (let friend of friendsResponse) {
      const response = await User.findOne({ username: friend.friend });
      if (!response) {
        return res.status(500).json({ message: "Internal server error" });
      }
      friends.push({
        username: response.username,
        email: response.email,
        firstname: response.firstname,
        lastname: response.lastname,
      });
    }

    return res.status(200).json({ username: username, friendsResponse });
  } catch (error) {
    console.error("Error checking existing friends:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = friendsRouter;
