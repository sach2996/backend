const Friend = require("../models/friends");
const Group = require("../models/groups");
const User = require("../models/users");

const addGroup = async (groupName, description, users, isPublic) => {
  if (!groupName) {
    throw new Error("Please mention group name");
  }

  if (!Array.isArray(users) || users.length <= 1) {
    throw new Error("You cannot create a group without at least two users");
  }

  const existingGroup = await Group.findOne({ groupName });
  if (existingGroup) {
    throw new Error("Group name already exists. Please choose another name.");
  }

  const userResponse = await User.find({ username: { $in: users } });

  // const userExistsResults = await Promise.all(userExistsPromises);
  const invalidUsers = userResponse.filter(
    (user) => !users.includes(user.username)
  );

  const usersToAdd = userResponse.map((user) => user.username);

  // console.log(userResponse, invalidUsers);
  if (invalidUsers.length > 0) {
    throw new Error(`Invalid user IDs: ${invalidUsers.join(", ")}`);
  }
  for (let user of users) {
    const userResult = await User.findOne({ username: user });

    for (let i = 0; i < users.length; i++) {
      if (users[i] != userResult.username) {
        const userToBeAdded = await User.findOne({ username: users[i] });
        console.log(userResult.username, userToBeAdded.username);
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

  return await newGroup.save();
};

const getGroups = async (username) => {
  let response = [];
  const groupsResponse = await Group.find({ users: username });

  if (groupsResponse.length == 0) {
    throw new Error("You are not part of any group");
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
  return response;
};
module.exports = { addGroup, getGroups };
