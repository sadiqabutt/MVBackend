
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    profileImage: { type: String, default: "https://placehold.co/600x400?text=User+Image" },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, lowercase: true, unique: true },
    userPassword: { type: String, required: true },
    userIsVerified: { type: Boolean, default: false },
    userVerificationToken: { type: String, default: null },
    userVerificationTokenExpiry: { type: Date, default: null },
    userPasswordResetToken: { type: String, default: null },
    userPasswordExpirationDate: { type: Date, default: null },
    userRefreshToken: { type: String, default: null },
    userRole: { type: String, enum: ["buyer", "store-admin", "factory-admin"], default: "buyer" },
    phoneNumber: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("userPassword")) return next();
  this.userPassword = await bcrypt.hash(this.userPassword, 10);
  next();
});

// ✅ Compare passwords
userSchema.methods.isPasswordCorrect = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.userPassword);
};

// ✅ Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      userName: this.userName,
      userEmail: this.userEmail,
      userRole: this.userRole,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

// ✅ Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

// ✅ Generate temporary token for verification or password reset
userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");
  const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  return { unHashedToken, hashedToken, tokenExpiry };
};

const User = mongoose.model("User", userSchema);
export default User;
