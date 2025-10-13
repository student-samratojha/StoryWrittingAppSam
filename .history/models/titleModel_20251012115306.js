const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
     storyImage: {
      type: String,
      required: true,
    },
    story: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId
      ref: "User", // reference to User model
      required: true,
    },
     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // user IDs who liked
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);
