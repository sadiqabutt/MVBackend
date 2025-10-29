
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  contact_no: { type: String },
  profileImage: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpiry: Date,
  adminRefreshToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Hash password before save
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Check password
adminSchema.methods.isPasswordCorrect = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

// Generate Access Token
adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, name: this.name, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "60m" }
  );
};

// Generate Refresh Token
adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

// Generate temporary token for verification or password reset
adminSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");
  const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  this.verificationToken = hashedToken;
  this.verificationTokenExpiry = tokenExpiry;
  this.resetPasswordToken = hashedToken;
  this.resetPasswordExpire = tokenExpiry;

  return unHashedToken; // send this raw token in email
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
