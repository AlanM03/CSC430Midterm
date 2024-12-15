const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a new category
router.post("/makeCategory", async (req, res) => {
  const { categoryName } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Category (categoryName) VALUES ($1) RETURNING *',
      [categoryName]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get all categories
router.get("/getCategories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Category");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete specific category
router.delete("/deleteCategory/:categoryID", async (req, res) => {
  const { categoryID } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM Category WHERE categoryID = $1 RETURNING *",
      [categoryID]
    );
    if (result.rowCount === 0) {
      res.status(404).send("Category not found");
    } else {
      res.status(200).json({ message: "Category deleted successfully", category: result.rows[0] });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
