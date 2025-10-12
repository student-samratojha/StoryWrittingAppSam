// const express = require("express");
// const User = require("../models/userModel");
// const jwt = require("jsonwebtoken");
// const router = express.Router();

// // Signup page
// router.get("/signup", (req, res) => {
//   res.render("signup");
// });
// function generateRandomNumber(length = 11) {
//   const digits = "0123456789";
//   let result = "";
//   let num = "";
//   for (let i = 0; i < length; i++) {
//     num += digits.charAt(Math.floor(Math.random() * digits.length));
//   }
//   result = `${new Date().getFullYear()}${num}`;
//   return result;
// }

// router.post("/signup", async (req, res) => {
//   const {
//     name,
//     email,
//     password,
//     image,
//     city,

//     occupation,
//     education,
//   } = req.body;

//   try {
//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.send("User already exists");

//     // Generate unique ID and make sure it's unique
//     let uniqueId;
//     let isUnique = false;
//     while (!isUnique) {
//       uniqueId = generateRandomNumber(11);
//       const userWithId = await User.findOne({ uniqueId });
//       if (!userWithId) isUnique = true;
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       image,
//       city,
//       occupation,
//       education,
//       uniqueId, // ← save in DB
//     });
//     res.render("sPro", { p: user }); // sPro page me dikhao
//   } catch (err) {
//     console.log(err);
//     res.send("Error creating user");
//   }
// });

// module.exports = router;

const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { RecaptchaV2 } = require("express-recaptcha");
const router = express.Router();

// Add your reCAPTCHA keys
const recaptcha = new RecaptchaV2('SITE_KEY', 'SECRET_KEY');

// Signup page
router.get("/signup", recaptcha.middleware.render, (req, res) => {
  res.render("signup", { captcha: res.recaptcha });
});

// Generate unique ID
function generateRandomNumber(length = 11) {
  const digits = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return `${new Date().getFullYear()}${result}`;
}

router.post("/signup", recaptcha.middleware.verify, async (req, res) => {
  const { name, email, password, image, city, occupation, education } = req.body;

  if (req.recaptcha.error) return res.send("Captcha failed, try again");

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.send("User already exists");

    // Generate unique ID
    let uniqueId;
    let isUnique = false;
    while (!isUnique) {
      uniqueId = generateRandomNumber(11);
      const userWithId = await User.findOne({ uniqueId });
      if (!userWithId) isUnique = true;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with verified=false
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      image,
      city,
      occupation,
      education,
      uniqueId,
      verified: false
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Story App account",
      html: `<p>Click <a href="http://localhost:3000/verify/${user._id}">here</a> to verify your account.</p>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      else console.log("Verification email sent: " + info.response);
    });

    res.send("Signup successful! Please verify your email to login.");

  } catch (err) {
    console.log(err);
    res.send("Error creating user");
  }
});

module.exports = router;
