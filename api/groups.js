const express = require("express");
const { Group, User, Friend } = require("./db");

const groupsRouter = express.Router();

groupsRouter.post("/", async (req, res) => {
  const { username, groupName, description, users, isPublic } = req.body;

  // Validate required fields
  if (!groupName) {
    return res.status(400).json({
      message: "Please mention group name",
    });
  }

  if (!Array.isArray(users) || users.length <= 1) {
    return res.status(400).json({
      message: "You cannot create a group without at least two users",
    });
  }

  try {
    // Check if group name already exists
    const existingGroup = await Group.findOne({ groupName });
    if (existingGroup) {
      return res.status(409).json({
        message: "Group name already exists. Please choose another name.",
      });
    }

    // Validate all user IDs and check if they exist in the User collection
    const userResponse = await User.find({ username: { $in: users } });

    // const userExistsResults = await Promise.all(userExistsPromises);
    const invalidUsers = userResponse.filter(
      (user) => !users.includes(user.username)
    );

    const usersToAdd = userResponse.map((user) => user.username);

    // console.log(userResponse, invalidUsers);
    if (invalidUsers.length > 0) {
      return res.status(400).json({
        message: `Invalid user IDs: ${invalidUsers.join(", ")}`,
      });
    }
    for (let user of users) {
      const userResult = await User.findOne({ username: user });
      // const userFriends = await Friend.find({
      //   $or: [{ user: userResult._id }, { friend: userResult._id }],
      // });
      // console.log(userResult.username, userFriends.length);

      for (let i = 0; i < users.length; i++) {
        if (users[i] != userResult.username) {
          const userToBeAdded = await User.findOne({ username: users[i] });
          console.log(userResult.username, userToBeAdded.username);
          // const newFriend = new Friend({
          //   user: userResult.username,
          //   friend: userToBeAdded.username,
          // });
          // await newFriend.save();
          const friendRecord = await Friend.findOneAndUpdate(
            {
              $or: [
                { user: userResult.username, friend: userToBeAdded.username },
                { user: userToBeAdded.username, friend: userResult.username },
              ],
            },
            {
              $setOnInsert: {
                user: userResult.username,
                friend: userToBeAdded.username,
              },
            }, // Update existing or create new
            { upsert: true, new: true } // Upsert option and return modified document
          );
          if (friendRecord) {
            console.log("Friend relationship updated/created successfully.");
          } else {
            console.log("Error creating friend relationship.");
          }
        }
      }
    }

    // Create and save the new group
    const newGroup = new Group({
      groupName,
      description,
      users: usersToAdd,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: isPublic !== undefined ? isPublic : true, // Default to true if not provided
    });

    const groupResponse = await newGroup.save();

    res.status(201).json({
      message: "Group created successfully",
      groupDetails: groupResponse,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

groupsRouter.get("/", async (req, res) => {
  const username = req.body.username;

  try {
    let response = [];
    // const user = await User.findOne({ username: username });

    const groupsResponse = await Group.find({ users: username });

    if (groupsResponse.length == 0) {
      return res.status(404).json({
        message: "You are not part of any group",
      });
    }

    for (let group of groupsResponse) {
      let usersResponse = [];
      for (let user of group.users) {
        const userResponse = await User.findOne({ username: user });
        usersResponse.push({
          username: userResponse.username,
          email: userResponse.email,
          firstname: userResponse.firstname,
          lastname: userResponse.lastname,
        });
      }
      response.push({
        groupName: group.groupName,
        description: group.description,
        users: usersResponse,
        transactions: group.transactions,
      });
    }
    return res.status(200).json({
      groups: response,
    });
  } catch (error) {
    console.error("Error checking groups:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = groupsRouter;
