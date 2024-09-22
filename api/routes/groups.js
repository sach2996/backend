// routes/groupRoutes.js
const express = require("express");
const { addGroup, getGroups } = require("../controller/groups.controller");

const groupsRouter = express.Router();

groupsRouter.post("/", addGroup);
groupsRouter.get("/", getGroups);

module.exports = groupsRouter;
