const groupsService = require("../services/groups.service");

const addGroup = async (req, res) => {
  const { groupName, description, users, isPublic } = req.body;

  try {
    const group = await groupsService.addGroup(
      groupName,
      description,
      users,
      isPublic
    );
    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Error creating group:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const getGroups = async (req, res) => {
  const username = req.body.username; // Use req.query instead of req.body for GET

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const groups = await groupsService.getGroups(username);
    res.status(200).json({
      message: "Groups details retrieved successfully",
      groups,
    });
  } catch (error) {
    console.error("Error getting groups info:", error.message);
    res.status(400).json({ message: error.message });
  }
};
module.exports = { addGroup, getGroups };
