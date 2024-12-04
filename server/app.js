// import modules
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const { Pool } = require("pg"); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/authenticateToken');

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

//route to make a user FOR TESTING
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

//route to make a user in production
app.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    try {
        // 1. Check if user already exists in the PostgreSQL database
        const existingUserResult = await pool.query(
            'SELECT * FROM "User" WHERE email = $1',
            [email]
        );

        if (existingUserResult.rows.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // checks if name exists
        const existingUsernameResult = await pool.query(
            'SELECT * FROM "User" WHERE username = $1',
            [username]
        );

        if (existingUsernameResult.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // 2. Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert the new user into the PostgreSQL User table
        const newUserResult = await pool.query(
            `INSERT INTO "User" (username, email, password) VALUES ($1, $2, $3) RETURNING *`,
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User created successfully', user: newUserResult.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

//route to logina  user and get JWT key
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user in the PostgreSQL database
        const userResult = await pool.query(
            'SELECT * FROM "User" WHERE email = $1',
            [email]
        );

        // If user doesn't exist
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userResult.rows[0];

        // Compare the provided password with the hashed password from the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token with the user's ID as the payload
        const token = jwt.sign(
            { userId: user.userid, email: user.email, username: user.username },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }  // expiration time
        );

        // Return the token as a response
        res.json({ token });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
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

//route to delete specific category
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

//route to delete item from stock
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

//route to add items to cart
app.post("/addToCart", authenticateToken, async (req, res) => {
    const userID = req.user.userId;
    const { itemID } = req.body;

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

//route to delete items in a users cart
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

//route to get all cart items for user
app.get("/getCartItems", authenticateToken, async (req, res) => {
    const userID = req.user.userId;

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

//route to checkout
app.post("/checkout", authenticateToken, async (req, res) => {
    const userID = req.user.userId;
    const { paymentMethod } = req.body;  // Ensure paymentMethod is coming from the request body

    // Validate that paymentMethod is provided
    if (!paymentMethod) {
        return res.status(400).json({ message: "Payment method is required" });
    }

    try {
        // Begin a transaction
        await pool.query('BEGIN');

        // 1. Get all items in the user's cart
        const cartItemsResult = await pool.query(
            `SELECT uci.cartitemid, i.itemid, i.itemname, i.price, i.stockquantity, uci.quantity
             FROM user_cart_item uci
             JOIN item i ON uci.itemid = i.itemid
             WHERE uci.userid = $1`,
            [userID]
        );

        const cartItems = cartItemsResult.rows;

        if (cartItems.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 2. Check stock availability for each item
        for (const item of cartItems) {
            if (item.quantity > item.stockquantity) {
                await pool.query('ROLLBACK');
                return res.status(400).json({ message: `Not enough stock for item: ${item.itemname}` });
            }
        }

        // 3. Calculate the total amount for the cart
        let totalAmount = 0;
        cartItems.forEach(item => {
            totalAmount += item.price * item.quantity;
        });

        // 4. Insert into the Purchase table
        const purchaseResult = await pool.query(
            'INSERT INTO purchase (userid, totalamount, paymentmethod) VALUES ($1, $2, $3) RETURNING *',
            [userID, totalAmount, paymentMethod]
        );
        const purchaseID = purchaseResult.rows[0].purchaseid;

        // 5. Insert each item from the cart into the Purchase_Item table and update stock
        for (const item of cartItems) {
            // Insert the item into the Purchase_Item table
            await pool.query(
                'INSERT INTO purchase_item (purchaseid, itemid, quantity, itemprice) VALUES ($1, $2, $3, $4)',
                [purchaseID, item.itemid, item.quantity, item.price]
            );

            // Update the stock quantity in the Item table
            await pool.query(
                'UPDATE item SET stockquantity = stockquantity - $1 WHERE itemid = $2',
                [item.quantity, item.itemid]
            );
        }

        // 6. Clear the user's cart
        await pool.query(
            'DELETE FROM user_cart_item WHERE userid = $1',
            [userID]
        );

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(200).json({ message: "Checkout completed successfully", purchaseID, totalAmount });
    } catch (err) {
        // Rollback the transaction in case of any error
        await pool.query('ROLLBACK');
        console.error('Error:', err);
        res.status(500).send("Server error");
    }
});

//gets all the item purchases for a user
app.get("/getPurchases", authenticateToken, async (req, res) => {
    const userID = req.user.userId;

    try {
        // Query to get all purchases and their items for the user
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

        // puts in structured format
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
                    quantity: quantity,
                    itemPrice: itemprice,
                    itemName: itemname,
                    description: description
                });
            }
        });

        // Convert purchases object to an array
        const detailedPurchases = Object.values(purchases);

        if (detailedPurchases.length === 0) {
            return res.status(404).json({ message: "No purchases found for this user" });
        }

        res.status(200).json(detailedPurchases);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send("Server error");
    }
});


// Route to show all purchases and their items
app.get("/getAllPurchases", async (req, res) => {
    try {
        // Query to get all purchases and their items for all users
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

        // structured format
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
                    quantity: quantity,
                    itemPrice: itemprice,
                    itemName: itemname,
                    description: description
                });
            }
        });

        // Convert purchases object to an array
        const detailedPurchases = Object.values(purchases);

        if (detailedPurchases.length === 0) {
            return res.status(404).json({ message: "No purchases found" });
        }

        res.status(200).json(detailedPurchases);
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
