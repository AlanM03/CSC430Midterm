// app.js
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");  
const userController = require("./controllers/userController");
const categoryController = require("./controllers/categoryController");
const itemController = require("./controllers/itemController");
const cartController = require("./controllers/cartController");
const purchaseController = require("./controllers/purchaseController");

// Initialize Express
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: false }));

// Controllers (i.e., route handlers)
app.use("/users", userController);
app.use("/categories", categoryController);
app.use("/items", itemController);
app.use("/cart", cartController);
app.use("/purchases", purchaseController);

// Health check or root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
