import { asyncHandler } from "../../core/utils/async-handler.js";
import User from "../../models/User.model.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { userForgotPasswordMailBody, userVerificationMailBody } from "../../shared/constants/mail.constant.js";
import { mailTransporter } from "../../shared/helpers/mail.helper.js";
import { storeAccessToken, storeLoginCookies } from "../../shared/helpers/cookies.helper.js";
import crypto from "crypto";
import S3UploadHelper from "../../shared/helpers/s3Upload.js"; // ✅ Added import for AWS logic


//🧩 Register User

const registerUser = asyncHandler(async (req, res) => {
  const { userName, userEmail, userPassword, userRole, phoneNumber, userAddress } = req.body;

  const existingUser = await User.findOne({ userEmail });
  if (existingUser) throw new ApiError(400, "User already exists");

  // ✅ Upload image to AWS S3 (if provided)
  let profileImageKey = null;
  if (req.file) {
    try {
      const uploadResult = await S3UploadHelper.uploadFile(req.file, "user-profiles");
      profileImageKey = uploadResult.key;
    } catch (error) {
      console.error("S3 Upload Error:", error);
      throw new ApiError(500, "Profile image upload failed");
    }
  }

  // ✅ Create new user
  const user = await User.create({
    userName,
    userEmail,
    userPassword,
    userRole,
    phoneNumber,
    userAddress,
    ...(profileImageKey && { profileImage: profileImageKey }),
  });

  if (!user) throw new ApiError(400, "User not created");

  // ✅ Generate verification token
  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.userVerificationToken = hashedToken;
  user.userVerificationTokenExpiry = tokenExpiry;
  await user.save();

  const verifyLink = `${process.env.BASE_URL}/api/v1/auth/verify/${unHashedToken}`;

let signedUrl = null;
if (user.profileImage) {
  signedUrl = await S3UploadHelper.getSignedUrl(user.profileImage);
}

  // ✅ Send verification email
  await mailTransporter.sendMail({
    from: process.env.MAIL_SENDER,
    to: userEmail,
    subject: "Verify your email",
    html: userVerificationMailBody(userName, verifyLink),
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        userName: user.userName,
        userEmail: user.userEmail,
        userRole: user.userRole,
        phoneNumber: user.phoneNumber,
        userAddress: user.userAddress,
        ...(profileImageKey && { profileImage: profileImageKey }),
         ...(signedUrl && { imageUrl: signedUrl }) // use signedUrl here
    
      },
      "User created successfully — check your email for verification link"
    )
  );
});







// ==============================
// 🔐 Login User
// ==============================
const logInUser = asyncHandler(async (req, res) => {
  const { userEmail, userPassword } = req.body;

  const user = await User.findOne({ userEmail });
  if (!user) throw new ApiError(400, "User not found");

  const isPasswordCorrect = await user.isPasswordCorrect(userPassword);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid password");

  if (!user.userIsVerified) throw new ApiError(400, "User not verified");

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  storeLoginCookies(res, accessToken, refreshToken, "user");

  user.userRefreshToken = refreshToken;
  await user.save();
  

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          userName: user.userName,
          userEmail: user.userEmail,
          userRole: user.userRole,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage || null,
          
        },
        tokens: { accessToken, refreshToken },
      },
      "User logged in successfully"
    )
  );
});

// ==============================
// 🚪 Logout User
// ==============================
const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "User not authenticated");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.userRefreshToken = null;
  await user.save();

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ==============================
// 📧 Verify Email
// ==============================
const verifyUserMail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) throw new ApiError(400, "Token not found");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    userVerificationToken: hashedToken,
    userVerificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired verification token");

  user.userIsVerified = true;
  user.userVerificationToken = null;
  user.userVerificationTokenExpiry = null;
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "User verified successfully"));
});

// ==============================
// 🔁 Get Access Token (Refresh)
// ==============================
const getAccessToken = asyncHandler(async (req, res) => {
  const { userRefreshToken } = req.cookies;
  if (!userRefreshToken) throw new ApiError(400, "Refresh token not found");

  const user = await User.findOne({ userRefreshToken });
  if (!user) throw new ApiError(400, "Invalid refresh token");

  const accessToken = await user.generateAccessToken();
  await storeAccessToken(res, accessToken, "user");

  return res.status(200).json(
    new ApiResponse(200, { accessToken }, "New access token generated successfully")
  );
});

// ==============================
// 🧠 Forgot Password
// ==============================
const forgotPasswordMail = asyncHandler(async (req, res) => {
  const { userEmail } = req.body;
  const user = await User.findOne({ userEmail });
  if (!user) throw new ApiError(400, "User not found");

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.userPasswordResetToken = hashedToken;
  user.userPasswordExpirationDate = tokenExpiry;
  await user.save();

  const resetLink = `${process.env.BASE_URL}/api/v1/auth/reset-password/${unHashedToken}`;

  await mailTransporter.sendMail({
    from: process.env.MAIL_SENDER,
    to: userEmail,
    subject: "Reset your password",
    html: userForgotPasswordMailBody(user.userName, resetLink),
  });

  return res.status(200).json(
    new ApiResponse(200, { resetLink }, "Password reset link sent successfully")
  );
});

// ==============================
// 🔑 Reset Password
// ==============================
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { userPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    userPasswordResetToken: hashedToken,
    userPasswordExpirationDate: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired password reset token");

  user.userPassword = userPassword;
  user.userPasswordResetToken = null;
  user.userPasswordExpirationDate = null;
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

// ==============================
// 📤 Export Controllers
// ==============================
export {
  registerUser,
  logInUser,
  logoutUser,
  verifyUserMail,
  getAccessToken,
  forgotPasswordMail,
  resetPassword,
};
