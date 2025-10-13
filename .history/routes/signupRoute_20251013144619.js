const express = require("express");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Signup page
router.get("/signup",verifyAdmin, (req, res) => {
  res.render("signup");
});
function generateRandomNumber(length = 11) {
  const digits = "0123456789";
  let result = "";
  let num = "";
  for (let i = 0; i < length; i++) {
    num += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  result = `${new Date().getFullYear()}${num}`;
  return result;
}

router.post("/signup", async (req, res) => {
  const {
    name,
    email,
    password,
    image,
    city,

    occupation,
    education,
  } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.send("User already exists");

    // Generate unique ID and make sure it's unique
    let uniqueId;
    let isUnique = false;
    while (!isUnique) {
      uniqueId = generateRandomNumber(11);
      const userWithId = await User.findOne({ uniqueId });
      if (!userWithId) isUnique = true;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      image,
      city,
      occupation,
      education,
      uniqueId, // ← save in DB
    });
    res.render("sPro", { p: user }); // sPro page me dikhao
  } catch (err) {
    console.log(err);
    res.send("Error creating user");
  }
});

async function verifyAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    req.userId = decoded.id;

    const user = await User.findById(req.userId);
    console.log("Fetched User:", user);

    if (!user) return res.redirect("/login");

    if (user.role === "admin") {
      req.user = user;
      next();
    } else {
      console.log("User is not admin, role:", user.role);
      return res.redirect("/login");
    }
  } catch (err) {
    console.log("JWT verification failed:", err.message);
    return res.redirect("/login");
  }
}
module.exports = router;