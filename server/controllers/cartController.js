const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authenticateToken");

// Add item to cart
router.post("/addToCart", authenticateToken, async (req, res) => {
  const userID = req.user.userId;
  const { itemID } = req.body;

  try {
    // Check if item already in cart
    const existingCartItem = await pool.query(
      "SELECT * FROM user_cart_item WHERE userid = $1 AND itemid = $2",
      [userID, itemID]
    );

    if (existingCartItem.rows.length > 0) {
      // Increase quantity
      const updatedCartItem = await pool.query(
        "UPDATE user_cart_item SET quantity = quantity + 1 WHERE cartitemid = $1 RETURNING *",
        [existingCartItem.rows[0].cartitemid]
      );
      res.status(200).json(updatedCartItem.rows[0]);
    } else {
      // Add new cart item
      const newCartItem = await pool.query(
        "INSERT INTO user_cart_item (userid, itemid, quantity) VALUES ($1, $2, 1) RETURNING *",
        [userID, itemID]
      );
      res.status(201).json(newCartItem.rows[0]);
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Server error");
  }
});

// Delete or decrement item from cart
router.delete("/deleteCartItem/:cartItemID", async (req, res) => {
  const { cartItemID } = req.params;
  try {
    const existingCartItem = await pool.query(
      "SELECT * FROM user_cart_item WHERE cartitemid = $1",
      [cartItemID]
    );

    if (existingCartItem.rows.length === 0) {
      res.status(404).json({ message: "Item not found in cart" });
    } else {
      const currentQuantity = existingCartItem.rows[0].quantity;
      if (currentQuantity > 1) {
        const updatedCartItem = await pool.query(
          "UPDATE user_cart_item SET quantity = quantity - 1 WHERE cartitemid = $1 RETURNING *",
          [cartItemID]
        );
        res.status(200).json({ message: "Item quantity decreased", item: updatedCartItem.rows[0] });
      } else {
        const deletedItem = await pool.query(
          "DELETE FROM user_cart_item WHERE cartitemid = $1 RETURNING *",
          [cartItemID]
        );
        res.status(200).json({ message: "Item deleted from cart", item: deletedItem.rows[0] });
      }
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Server error");
  }
});

// Get all cart items for user
router.get("/getCartItems", authenticateToken, async (req, res) => {
  const userID = req.user.userId;
  try {
    const cartItems = await pool.query(
      `SELECT uci.cartitemid, i.itemid, i.itemname, i.price, uci.quantity, i.description
       FROM user_cart_item uci
       JOIN item i ON uci.itemid = i.itemid
       WHERE uci.userid = $1`,
      [userID]
    );

    if (cartItems.rows.length === 0) {
      res.status(404).json({ message: "No items found in user's cart" });
    } else {
      res.status(200).json(cartItems.rows);
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
