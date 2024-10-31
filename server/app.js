// import modules
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

// app 
const app = express();

// middleware
app.use(morgan("dev"));


app.use(cors({ origin: true, credentials: true }));


app.use(express.urlencoded({//lets you do stuff with payloads can do req.body.whateverInfo to get specific data from json
    extended: true
  }));

app.use(express.json({extended: false}));

app.get("/", (req, res) => {
    res.send("430 testing")
  });

// port
const port = process.env.PORT || 8080;

//listener
const server = app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;