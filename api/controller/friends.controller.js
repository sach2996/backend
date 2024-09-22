const friendService = require("../services/friends.service");

const addFriend = async (req, res) => {
  const { friendId, username } = req.body;

  if (!friendId || !username) {
    return res
      .status(400)
      .json({ message: "Missing required fields: friendId or username" });
  }

  try {
    const friend = await friendService.addFriend(friendId, username);
    res.status(201).json({
      message: "Friend added successfully",
      friend: friend,
    });
  } catch (error) {
    console.error("Error adding friend:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const getFriends = async (req, res) => {
  const username = req.body.username; // Use req.query instead of req.body for GET

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const friends = await friendService.getFriends(username);
    res.status(200).json({
      message: "Friends details retrieved successfully",
      friends,
    });
  } catch (error) {
    console.error("Error getting friends info:", error.message);
    res.status(400).json({ message: error.message });
  }
};
module.exports = { addFriend, getFriends };
