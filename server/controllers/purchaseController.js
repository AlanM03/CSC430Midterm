const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authenticateToken");

// Checkout
router.post("/checkout", authenticateToken, async (req, res) => {
  const userID = req.user.userId;
  const { paymentMethod } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({ message: "Payment method is required" });
  }

  try {
    await pool.query("BEGIN");

    const cartItemsResult = await pool.query(
      `SELECT uci.cartitemid, i.itemid, i.itemname, i.price, i.stockquantity, uci.quantity
       FROM user_cart_item uci
       JOIN item i ON uci.itemid = i.itemid
       WHERE uci.userid = $1`,
      [userID]
    );
    const cartItems = cartItemsResult.rows;

    if (cartItems.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check stock
    for (const item of cartItems) {
      if (item.quantity > item.stockquantity) {
        await pool.query("ROLLBACK");
        return res.status(400).json({ message: `Not enough stock for item: ${item.itemname}` });
      }
    }

    // Calculate total
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    // Insert into Purchase
    const purchaseResult = await pool.query(
      "INSERT INTO purchase (userid, totalamount, paymentmethod) VALUES ($1, $2, $3) RETURNING *",
      [userID, totalAmount, paymentMethod]
    );
    const purchaseID = purchaseResult.rows[0].purchaseid;

    // Insert each item into Purchase_Item and update stock
    for (const item of cartItems) {
      await pool.query(
        "INSERT INTO purchase_item (purchaseid, itemid, quantity, itemprice) VALUES ($1, $2, $3, $4)",
        [purchaseID, item.itemid, item.quantity, item.price]
      );
      await pool.query(
        "UPDATE item SET stockquantity = stockquantity - $1 WHERE itemid = $2",
        [item.quantity, item.itemid]
      );
    }

    // Clear cart
    await pool.query("DELETE FROM user_cart_item WHERE userid = $1", [userID]);
    await pool.query("COMMIT");

    res.status(200).json({ message: "Checkout completed successfully", purchaseID, totalAmount });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error:", err);
    res.status(500).send("Server error");
  }
});

// Get user-specific purchases
router.get("/getPurchases", authenticateToken, async (req, res) => {
  const userID = req.user.userId;
  try {
    const purchasesResult = await pool.query(
      `SELECT p.purchaseid, p.purchasedate, p.totalamount, p.paymentmethod,
              pi.purchaseitemid, pi.itemid, pi.quantity, pi.itemprice,
              i.itemname, i.description
       FROM purchase p
       LEFT JOIN purchase_item pi ON p.purchaseid = pi.purchaseid
       LEFT JOIN item i ON pi.itemid = i.itemid
       WHERE p.userid = $1
       ORDER BY p.purchasedate DESC`,
      [userID]
    );

    const purchases = {};

    purchasesResult.rows.forEach(row => {
      const {
        purchaseid,
        purchasedate,
        totalamount,
        paymentmethod,
        purchaseitemid,
        itemid,
        quantity,
        itemprice,
        itemname,
        description
      } = row;

      if (!purchases[purchaseid]) {
        purchases[purchaseid] = {
          purchaseID: purchaseid,
          purchaseDate: purchasedate,
          totalAmount: totalamount,
          paymentMethod: paymentmethod,
          items: []
        };
      }

      if (purchaseitemid) {
        purchases[purchaseid].items.push({
          purchaseItemID: purchaseitemid,
          itemID: itemid,
          quantity,
          itemPrice: itemprice,
          itemName: itemname,
          description
        });
      }
    });

    const detailedPurchases = Object.values(purchases);
    if (detailedPurchases.length === 0) {
      return res.status(404).json({ message: "No purchases found for this user" });
    }

    res.status(200).json(detailedPurchases);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Server error");
  }
});

// Get all purchases (admin or testing)
router.get("/getAllPurchases", async (req, res) => {
  try {
    const purchasesResult = await pool.query(
      `SELECT p.purchaseid, p.userid, u.username, p.purchasedate, p.totalamount, p.paymentmethod,
              pi.purchaseitemid, pi.itemid, pi.quantity, pi.itemprice,
              i.itemname, i.description
       FROM purchase p
       LEFT JOIN purchase_item pi ON p.purchaseid = pi.purchaseid
       LEFT JOIN item i ON pi.itemid = i.itemid
       LEFT JOIN "User" u ON p.userid = u.userid
       ORDER BY p.purchasedate DESC`
    );

    const purchases = {};

    purchasesResult.rows.forEach(row => {
      const {
        purchaseid,
        userid,
        username,
        purchasedate,
        totalamount,
        paymentmethod,
        purchaseitemid,
        itemid,
        quantity,
        itemprice,
        itemname,
        description
      } = row;

      if (!purchases[purchaseid]) {
        purchases[purchaseid] = {
          purchaseID: purchaseid,
          userID: userid,
          username: username,
          purchaseDate: purchasedate,
          totalAmount: totalamount,
          paymentMethod: paymentmethod,
          items: []
        };
      }

      if (purchaseitemid) {
        purchases[purchaseid].items.push({
          purchaseItemID: purchaseitemid,
          itemID: itemid,
          quantity,
          itemPrice: itemprice,
          itemName: itemname,
          description
        });
      }
    });

    const detailedPurchases = Object.values(purchases);
    if (detailedPurchases.length === 0) {
      return res.status(404).json({ message: "No purchases found" });
    }

    res.status(200).json(detailedPurchases);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
