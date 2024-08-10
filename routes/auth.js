const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
// Registration route
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    // Create a new user
    const user = new User({ username, password });
    await user.save();

    res.status(201).send("User registered");
  } catch (err) {
    res.status(500).send("Error registering user");
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .send({ error: "Please enter valid username and password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).send({ error: "Error logging in" });
  }
});

module.exports = router;
