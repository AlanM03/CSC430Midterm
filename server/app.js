// import modules
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const { Pool } = require("pg"); // Import the pg module

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

// Sample route to test database query
app.get("/users", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "User"');
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
