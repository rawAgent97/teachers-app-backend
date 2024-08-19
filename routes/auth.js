const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
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
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password:hashedPassword });
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

router.post('/forgot-password', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send('Username incorrect');
    }
    console.log("user exists")
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await User.updateOne({ username }, { password: hashedPassword });

    res.status(200).send('Password updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

router.get('/check', async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(200).send(`${username} is available`);
    } else {
      return res.status(404).send(`${username} already taken`);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
