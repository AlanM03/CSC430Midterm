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

// Create a connection pool
const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
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

// Route to create a new item with category
app.post("/postItem", async (req, res) => {
    const { itemName, categoryID, price, stockQuantity, description } = req.body;
    try {
        // Check if item already exists with the same name and price
        const existingItem = await pool.query(
            'SELECT * FROM Item WHERE itemName = $1 AND price = $2',
            [itemName, price]
        );

        if (existingItem.rows.length > 0) {
            // Item exists, update the stock quantity
            const updatedItem = await pool.query(
                'UPDATE Item SET stockQuantity = stockQuantity + $1 WHERE itemID = $2 RETURNING *',
                [stockQuantity, existingItem.rows[0].itemID]
            );
            res.status(200).json(updatedItem.rows[0]);
        } else {
            // Item does not exist, create a new item
            const result = await pool.query(
                'INSERT INTO Item (itemName, categoryID, price, stockQuantity, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [itemName, categoryID, price, stockQuantity, description]
            );
            res.status(201).json(result.rows[0]);
        }
    } catch (err) {
        console.error(err.message);
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

app.get("/", (req, res) => {
    res.send("430 testing");
});

// port
const port = process.env.PORT || 8080;

// listener
const server = app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;
