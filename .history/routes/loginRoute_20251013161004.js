const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// Generate captcha
function genCaptcha(length = 5) {
  const digits = "abcdefghijklmnopqrstuvwxyz1234567890";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
}
router.post("/login", async (req, res) => {
  const { email, password, captchacode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/login");
    }

    if (!user.isApproved) {
      req.flash("error_msg", "Your account is pending admin approval");
      return res.redirect("/login");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/login");
    }

    const storedCaptcha = req.cookies.captcha;
    if (!storedCaptcha || captchacode.trim().toLowerCase() !== storedCaptcha.toLowerCase()) {
      req.flash("error_msg", "Invalid captcha code");
      return res.redirect("/login");
    }

    // JWT
    const token = jwt.sign({ uniqueId: user.uniqueId, id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true });
    res.clearCookie("captcha");

    req.flash("success_msg", "Logged in successfully");
    res.redirect("/dashboard");

  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Server error");
    res.redirect("/login");
  }
});


// Login page
router.get("/login", (req, res) => {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true }); // cookie me store
  res.render("login", { captcha });
});

// router.post("/login", async (req, res) => {
//   const { email, password, captchacode } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).send("Invalid credentials");
//  if (!user.isApproved) return res.send('Your account is pending admin approval');
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) return res.status(401).send("Invalid credentials");

//     // Captcha check from cookie
//     const storedCaptcha = req.cookies.captcha;
//     if (
//       !storedCaptcha ||
//       captchacode.trim().toLowerCase() !== storedCaptcha.toLowerCase()
//     ) {
//       return res.send("Invalid captcha code");
//     }

//     // JWT
//     const token = jwt.sign(
//       { uniqueId: user.uniqueId, id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );
//     res.cookie("token", token, { httpOnly: true });

//     // captcha clear kar do (optional)
//     res.clearCookie("captcha");

//     res.redirect("/dashboard");
//   } catch (err) {
//     console.log(err);
//     res.send("Login error");
//   }
// });

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;
