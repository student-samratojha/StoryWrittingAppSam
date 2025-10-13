const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const jwt = require("jsonwebtoken");
const titleModel = require("../models/titleModel");
async function verifyUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.redirect("/login");

  try {
    // ✅ Step 1: Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    // ✅ Step 2: Find the user in DB
    const user = await User.findById(req.userId);

    if (!user) return res.redirect("/login");

    // ✅ Step 3: Check role
    if (user.role === "user") {
      next();
    } else {
      return res.redirect("/login");
    }
  } catch (err) {
    console.log("JWT verification failed:", err.message);
    return res.redirect("/login");
  }
}

router.get("/dashboard", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.redirect("/login");

    if (user.role === "admin") {
      // सभी users fetch करो
      const users = await User.find();
  const pending = await User.find({ isApproved: false });
  const pendingStories = await t.find({ isApproved: false }).populate('author');
      // Har user ke stories fetch karo
      const usersWithStories = await Promise.all(
        users.map(async (u) => {
          const stories = await titleModel
            .find({ userId: u._id })
            .sort({ createdAt: -1 });
          return { ...u.toObject(), stories };
        })
      );

      // Admin dashboard render karo
      return res.render("Admindashboard", {
        admin: user,
        pendingStories,
        pending,
        users: usersWithStories,
      });
    } else {
      // Normal user dashboard
      const st = await titleModel
        .find({ userId: user._id })
        .sort({ createdAt: -1 });
      return res.render("Userdashboard", { user, st });
    }
  } catch (err) {
    console.log("JWT verification failed:", err.message);
    return res.redirect("/login");
  }
});

router.post("/feed", async (req, res) => {
    const token = req.cookies.token;
  if (!token) return res.redirect("/login");
   
  const { title, story, userId, storyImage } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.redirect("/login");
    const st = await titleModel.create({
      title,
      story,
      userId,
        isApproved: false, // pending,
      storyImage,
    });
     res.send('Your story is pending admin approval.');
  } catch (err) {
    console.log(err);
    res.send("Error loading dashboard");
  }
});

router.get("/storyCor", verifyUser, async function (req, res) {
  // Populate username from userId
  const stories = await titleModel.find().sort({ createdAt: -1 }).lean();

  // Attach user name
  const Allst = await Promise.all(
    stories.map(async (story) => {
      const user = await User.findById(story.userId).lean();
      return { ...story, userName: user ? user.name : "Unknown" };
    })
  );
  res.render("storyCor", { Allst, user: req.userId });
});
router.post("/like-story/:id", verifyUser, async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.userId;

    const story = await titleModel.findById(storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    // ✅ check: user apni story like na kare
    if (story.userId.toString() === userId.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot like your own story" });
    }

    const likedIndex = story.likes.findIndex(
      (id) => id.toString() === userId.toString()
    );

    let liked = false;

    if (likedIndex === -1) {
      story.likes.push(userId); // Like
      liked = true;
    } else {
      story.likes.splice(likedIndex, 1); // Dislike
      liked = false;
    }

    await story.save();

    res.json({ liked, likesCount: story.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
