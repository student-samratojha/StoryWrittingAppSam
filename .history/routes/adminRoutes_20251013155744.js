const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const jwt = require("jsonwebtoken");
const titleModel = require("../models/titleModel");

async function verifyAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded JWT:", decoded);

    req.userId = decoded.id;

    const user = await User.findById(req.userId);
    // console.log("Fetched User:", user);

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

router.post("/admin/approve-story/:id", verifyAdmin, async (req, res) => {
  try {
    await titleModel.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error approving story");
  }
});
router.post("/admin/reject-story/:id", verifyAdmin, async (req, res) => {
  await titleModel.findByIdAndDelete(req.params.id);
  res.redirect("/dashboard");
});

// approve a user
router.post("/admin/approve/:id", verifyAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isApproved: true });
  // optional: send email to user notifying approval
  res.redirect("/dashboard"); // ya admin dashboard page
});

// reject/delete
router.post("/admin/reject/:id", verifyAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/dashboard"); // ya admin dashboard page
});
router.get("/delete-user/:id", verifyAdmin, async function (req, res) {
  try {
    const userIdToDelete = req.params.id;

    // Admin khud ko delete na kar paye
    if (userIdToDelete === req.userId.toString()) {
      return res.status(400).send("Error: Admin cannot delete themselves!");
    }

    const deletedUser = await User.findByIdAndDelete(userIdToDelete);

    if (!deletedUser) {
      return res.status(404).send("Error: User not found");
    }

    console.log(`Successfully deleted user: ${deletedUser.name}`);
    res.redirect("/dashboard"); // ya admin dashboard page
  } catch (error) {
    console.log("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
});

router.get("/storyCorner", async function (req, res) {
  // Populate username from userId
  const stories = await titleModel
    .find({ isApproved: true })
    .sort({ createdAt: -1 })
    .lean();

  // Attach user name
  const Allstory = await Promise.all(
    stories.map(async (story) => {
      const user = await User.findById(story.userId).lean();
      return { ...story, userName: user ? user.name : "Unknown" };
    })
  );
  res.render("storyCorner", { Allstory });
});

module.exports = router;
