const express = require("express");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Signup page
router.get("/signup", (req, res) => {
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
    adharNumber,
    occupation,
    education,
    phoneNumber,
    dob,
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
      adharNumber,
      occupation,
      education,
      phoneNumber,
      dob,
      uniqueId, // ← save in DB
    });
    res.render("sPro", { p: user }); // sPro page me dikhao
  } catch (err) {
    console.log(err);
    res.send("Error creating user");
  }
});

module.exports = router;
