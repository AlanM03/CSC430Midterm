const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a new item (or update stock if item exists)
router.post("/postItem", async (req, res) => {
    let { itemName, categoryID, price, stockQuantity, description, imageURL } = req.body;
  
    // Trim and normalize itemName
    itemName = itemName.trim().toLowerCase();
    price = Number(parseFloat(price).toFixed(2));
    stockQuantity = parseInt(stockQuantity);
  
    try {
      const insertQuery = `
        INSERT INTO item (itemname, categoryid, price, stockquantity, description, imageurl) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `;
      const insertResult = await pool.query(insertQuery, [itemName, categoryID, price, stockQuantity, description, imageURL]);
      res.status(201).json(insertResult.rows[0]);
    } catch (err) {
      console.error('Error in postItem:', err);
      res.status(500).send("Server error");
    }
  });
  

// Get all items
router.get("/getItems", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Item");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get items by category
router.get("/getItemsByCategory/:categoryID", async (req, res) => {
  const { categoryID } = req.params;
  try {
    const items = await pool.query(
      "SELECT * FROM item WHERE categoryid = $1",
      [categoryID]
    );
    if (items.rows.length === 0) {
      res.status(404).json({ message: "No items found for this category" });
    } else {
      res.status(200).json(items.rows);
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Server error");
  }
});

// Delete item
router.delete("/deleteItem/:itemID", async (req, res) => {
  const { itemID } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM Item WHERE itemID = $1 RETURNING *",
      [itemID]
    );
    if (result.rowCount === 0) {
      res.status(404).send("Item not found");
    } else {
      res.status(200).json({ message: "Item deleted successfully", item: result.rows[0] });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
