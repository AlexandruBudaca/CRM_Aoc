const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");

/* GET users listing. */
router.get("/users", (req, res) => {
  User.find().then((users) => res.json(users));
});

module.exports = router;
