const express = require("express");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Generate captcha
function genCaptcha(length = 5) {
  const digits = "abcdefghijklmnopqrstuvwxyz1234567890";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
}

// Login page
router.get("/signup", (req, res) => {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true }); // cookie me store
  res.render("signup", { captcha });
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
  const { name, email, password, image, city, occupation, education } =
    req.body;

  try {
    // Email validation: sirf @gmail.com allow
    if (!email.endsWith("@gmail.com")) {
      return res.send("Please use a valid Gmail address");
    }

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
      uniqueId,
      isApproved:
    });

    res.render("sPro", { p: user });
  } catch (err) {
    console.log(err);
    res.send("Error creating user");
  }
});

module.exports = router;
