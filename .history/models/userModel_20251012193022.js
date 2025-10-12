const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },

    occupation: {
      type: String,
      required: [true, "Occupation is required"],
    },
    education: {
      type: String,
      required: [true, "Education is required"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    uniqueId: { type: String, unique: true, required: true }, // ← yahan
  },
  { timestamps: true }
);

// Password hashing before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password compare method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
