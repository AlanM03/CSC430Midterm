// import modules
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const { Pool } = require("pg"); 

// app 
const app = express();

// middleware
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: false }));

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: false
    }
});
  
  // Test the database connection
  pool.connect((err, client, release) => {
    if (err) {
      return console.error("Error acquiring client", err.stack);
    }
    console.log("Connected to the database");
    release();
  });

//route to get all users
app.get("/getUsers", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "User"');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

//route to make a user
app.post("/createUser", async (req, res) => {
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

// Route to create a new category
app.post("/makeCategory", async (req, res) => {
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

// Route to get all categories
app.get("/getCategories", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Category');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

app.delete("/deleteCategory/:categoryID", async (req, res) => {
    const { categoryID } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM Category WHERE categoryID = $1 RETURNING *',
            [categoryID]
        );
        if (result.rowCount === 0) {
            // No category found with that ID
            res.status(404).send("Category not found");
        } else {
            res.status(200).json({ message: "Category deleted successfully", category: result.rows[0] });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Route to create a new item with category and if item exists already just add to total
app.post("/postItem", async (req, res) => {
    let { itemName, categoryID, price, stockQuantity, description } = req.body;

    // Trim and normalize itemName
    itemName = itemName.trim().toLowerCase();

    try {
        // Ensure price has fixed precision and is a number
        price = Number(parseFloat(price).toFixed(2));

        // Ensure stockQuantity is an integer
        stockQuantity = parseInt(stockQuantity);

        // Log values for debugging
        console.log('Normalized itemName:', itemName);
        console.log('Normalized price:', price);
        console.log('categoryID:', categoryID);
        console.log('stockQuantity:', stockQuantity);

        // Check if item already exists with the same name, price, and category
        const existingItemQuery = `
            SELECT * FROM item 
            WHERE itemname = $1 AND price = $2 AND categoryid = $3
        `;
        const existingItemResult = await pool.query(existingItemQuery, [itemName, price, categoryID]);

        console.log('Existing item query result:', existingItemResult.rows);

        if (existingItemResult.rows.length > 0) {
            // Item exists, update the stock quantity
            const existingItem = existingItemResult.rows[0];
            const updateQuery = `
                UPDATE item 
                SET stockquantity = stockquantity + $1 
                WHERE itemid = $2 
                RETURNING *
            `;
            const updatedItemResult = await pool.query(updateQuery, [stockQuantity, existingItem.itemid]);
            res.status(200).json(updatedItemResult.rows[0]);
        } else {
            // Item does not exist, create a new item
            const insertQuery = `
                INSERT INTO item (itemname, categoryid, price, stockquantity, description) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            const insertResult = await pool.query(insertQuery, [itemName, categoryID, price, stockQuantity, description]);
            res.status(201).json(insertResult.rows[0]);
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send("Server error");
    }
});

// Route to get all items
app.get("/getItems", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Item');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Route to get all items within a certain category
app.get("/getItemsByCategory/:categoryID", async (req, res) => {
    const { categoryID } = req.params;

    try {
        // Log the categoryID for debugging
        console.log('Category ID:', categoryID);

        // Query to get all items within the specified category
        const items = await pool.query(
            'SELECT * FROM item WHERE categoryid = $1',
            [categoryID]
        );

        // Check if any items were found
        if (items.rows.length === 0) {
            res.status(404).json({ message: "No items found for this category" });
        } else {
            res.status(200).json(items.rows);
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send("Server error");
    }
});

app.delete("/deleteItem/:itemID", async (req, res) => {
    const { itemID } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM Item WHERE itemID = $1 RETURNING *',
            [itemID]
        );
        if (result.rowCount === 0) {
            // No item found with that ID
            res.status(404).send("Item not found");
        } else {
            res.status(200).json({ message: "Item deleted successfully", item: result.rows[0] });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

app.post("/addToCart", async (req, res) => {
    const { userID, itemID } = req.body;

    try {
        // Check if the item already exists in the user's cart
        const existingCartItem = await pool.query(
            'SELECT * FROM user_cart_item WHERE userid = $1 AND itemid = $2',
            [userID, itemID]
        );

        if (existingCartItem.rows.length > 0) {
            // Item exists, increase the quantity
            const updatedCartItem = await pool.query(
                'UPDATE user_cart_item SET quantity = quantity + 1 WHERE cartitemid = $1 RETURNING *',
                [existingCartItem.rows[0].cartitemid]
            );
            res.status(200).json(updatedCartItem.rows[0]);
        } else {
            // Item does not exist in the cart, add it with quantity = 1
            const newCartItem = await pool.query(
                'INSERT INTO user_cart_item (userid, itemid, quantity) VALUES ($1, $2, 1) RETURNING *',
                [userID, itemID]
            );
            res.status(201).json(newCartItem.rows[0]);
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send("Server error");
    }
});

app.delete("/deleteCartItem/:cartItemID", async (req, res) => {
    const { cartItemID } = req.params;

    try {
        // Query to get the current quantity of the item in the cart
        const existingCartItem = await pool.query(
            'SELECT * FROM user_cart_item WHERE cartitemid = $1',
            [cartItemID]
        );

        if (existingCartItem.rows.length === 0) {
            // No such item found in the cart
            res.status(404).json({ message: "Item not found in cart" });
        } else {
            const currentQuantity = existingCartItem.rows[0].quantity;

            if (currentQuantity > 1) {
                // Decrement the quantity by 1
                const updatedCartItem = await pool.query(
                    'UPDATE user_cart_item SET quantity = quantity - 1 WHERE cartitemid = $1 RETURNING *',
                    [cartItemID]
                );
                res.status(200).json({ message: "Item quantity decreased", item: updatedCartItem.rows[0] });
            } else {
                // Quantity is 1, delete the item from the cart
                const deletedItem = await pool.query(
                    'DELETE FROM user_cart_item WHERE cartitemid = $1 RETURNING *',
                    [cartItemID]
                );
                res.status(200).json({ message: "Item deleted from cart", item: deletedItem.rows[0] });
            }
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send("Server error");
    }
});

app.get("/getCartItems/:userID", async (req, res) => {
    const { userID } = req.params;

    try {
        // Query to get all items in the user's cart, including item details
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
        console.error('Error:', err);
        res.status(500).send("Server error");
    }
});



// port
const port = process.env.PORT || 8080;

// listener
const server = app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;
