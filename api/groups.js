const express = require("express");
const { Group, User } = require("./db");

const groupsRouter = express.Router();

groupsRouter.post("/", async (req, res) => {
  const { groupName, description, users, isPublic } = req.body;

  if (!groupName) {
    return res.status(500).json({
      message: "Please mention group name",
    });
  }
  if (users.length <= 1) {
    return res.status(500).json({
      message: "You cannot create a group without two users",
    });
  }

  try {
    const group = new Group({
      groupName: groupName,
      description: description,
      users: users,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: isPublic,
    });
    const groupResponse = await group.save();
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
  //   const { username } = req.params;
  //   console.log(req.body);

  //   if (username != req.body.username) {
  //     return res.status(409).json({
  //       message: "You are not authorized to see other person's friends",
  //     });
  //   }

  const username = req.body.username;

  try {
    let response = [];
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
