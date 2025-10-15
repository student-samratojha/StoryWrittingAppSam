require("dotenv").config();
const rateLimit = require("express-rate-limit");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
// Rate Limiter for sensitive routes
// ==========================
const authLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minutes
  max: 5, // Max 5 requests per IP per window
  message: "Too many attempts. Please try again after 20 minutes.",
});
const app = express();

// Apply rate limiter only to login & register routes
app.use("/login", authLimiter);
app.use("/register", authLimiter);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// Home route
app.get("/", (req, res) => {
  res.render("home");
});





const session = require("express-session");
const flash = require("connect-flash");

const MongoStore = require("connect-mongo");

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: { secure: false, maxAge: 1000 * 60 * 60 } // 1 hour
}));

app.use(flash());

// Flash messages globally available in EJS
app.use((req, res, next) => {
  res.locals.error_msg = req.flash("error_msg");
  res.locals.success_msg = req.flash("success_msg");
  next();
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
