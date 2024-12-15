const express = require("express");
const router = express.Router();
const pool = require("../db");  // Import pool from db.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/authenticateToken");

// GET all users
router.get("/getUsers", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "User"');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Create a user (FOR TESTING)
router.post("/createUser", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO "User" (username, password, email) VALUES ($1, $2, $3) RETURNING *',
      [username, password, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Register a new user
router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;
  try {
    // 1. Check if user already exists
    const existingUserResult = await pool.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    );
    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // 2. Check if username already exists
    const existingUsernameResult = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );
    if (existingUsernameResult.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert the new user
    const newUserResult = await pool.query(
      'INSERT INTO "User" (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully", user: newUserResult.rows[0] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login and get JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find user by email
    const userResult = await pool.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    // 2. Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user.userid, email: user.email, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
