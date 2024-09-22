// routes/groupRoutes.js
const express = require("express");
const { addFriend, getFriends } = require("../controller/friends.controller");

const friendsRouter = express.Router();

friendsRouter.post("/", addFriend);
friendsRouter.get("/", getFriends);

module.exports = friendsRouter;
