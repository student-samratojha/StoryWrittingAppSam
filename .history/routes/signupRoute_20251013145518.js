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
  const {
    name,
    email,
    password,
    image,
    city,
    occupation,
    education,
    captchacode,
  } = req.body;

  try {
    // Captcha check from cookie
    const storedCaptcha = req.cookies.captcha;
    if (
      !storedCaptcha ||
      captchacode.trim().toLowerCase() !== storedCaptcha.toLowerCase()
    ) {
      req.flash("error_msg", "Invalid captcha code");
      return res.redirect("/signup");
    }

    // Email validation
    if (!email.endsWith("@gmail.com")) {
      req.flash("error_msg", "Please use a valid Gmail address");
      return res.redirect("/signup");
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error_msg", "User already exists");
      return res.redirect("/signup");
    }

    // Generate unique ID
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
      isApproved: false,
    });

    // Optional: clear captcha
    res.clearCookie("captcha");

    req.flash(
      "success_msg",
      "Account created successfully. Pending admin approval"
    );
    res.redirect("spro",{s:user});
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Server error");
    res.redirect("/signup");
  }
});

module.exports = router;
