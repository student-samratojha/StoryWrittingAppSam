require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connect
mongoos
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// Home route
app.get("/", (req, res) => {
  res.render("home");
});

// Import auth routes
const signupRoutes = require("./routes/signupRoute");
app.use("/", signupRoutes);

// Import auth routes
const loginRoutes = require("./routes/loginRoute");
app.use("/", loginRoutes);
// Import auth routes
const dashboardRoutes = require("./routes/dashboardRoute");
app.use("/", dashboardRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/", adminRoutes);
// Start server
app.listen(process.env.PORT, () =>
  console.log(`Server running at http://localhost:${process.env.PORT}`)
);
