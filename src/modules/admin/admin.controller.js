import {asyncHandler }from "../../core/utils/async-handler.js"
import Admin from "../../models/admin.models.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import bcrypt from "bcryptjs";

// 🧾 Register Admin
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, contact_no, role } = req.body;
  const file = req.file;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  // Upload profile image to S3 (if any)
  let profileImageKey = "";
  if (file) {
    const uploadResult = await S3UploadHelper.uploadFile(file, "admin-profiles");
    profileImageKey = uploadResult.key; // Store the S3 key
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    contact_no,
    role,
    profileImage: profileImageKey,
  });

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    admin,
  });
});

// 🔐 Login Admin
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const isPasswordCorrect = await bcrypt.compare(password, admin.password);
  if (!isPasswordCorrect) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  admin.adminRefreshToken = refreshToken;
  await admin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      profileImage: admin.profileImage,
    },
  });
});



export const logoutAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user?._id);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  admin.adminRefreshToken = null;
  await admin.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});


// 👤 Get Admin Profile
export const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id).select("-password");
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  res.status(200).json({
    success: true,
    admin,
  });
});

// 🖼️ Update Admin Profile Image
export const updateAdminProfileImage = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  const file = req.file;
  if (!file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  // Delete old image from S3 if exists
  if (admin.profileImage) {
    await S3UploadHelper.deleteFile(admin.profileImage);
  }

  // Upload new image
  const uploadResult = await S3UploadHelper.uploadFile(file, "admin-profiles");
  admin.profileImage = uploadResult.key;
  await admin.save();

  // Generate signed URL to return
  const signedUrl = await S3UploadHelper.getSignedUrl(uploadResult.key, 3600);

  res.status(200).json({
    success: true,
    message: "Profile image updated successfully",
    data: { profileImageUrl: signedUrl },
  });
});


// 🗑️ Delete Admin Profile Image
export const deleteAdminProfileImage = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  if (!admin.profileImage) {
    res.status(400);
    throw new Error("No profile image to delete");
  }

  // Delete image from S3
  await S3UploadHelper.deleteFile(admin.profileImage);
  admin.profileImage = "";
  await admin.save();

  res.status(200).json({
    success: true,
    message: "Profile image deleted successfully",
  });
});


// 🟡 Super Admin: Update any Admin
export const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findById(id);
  if (!admin) throw new ApiError(404, "Admin not found");

  Object.assign(admin, req.body); // update fields from body
  await admin.save();

  res.status(200).json(new ApiResponse(200, admin, "Admin updated successfully"));
});

// 🟡 Super Admin: Delete any Admin
export const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findById(id);
  if (!admin) throw new ApiError(404, "Admin not found");

  await admin.deleteOne();

  res.status(200).json(new ApiResponse(200, null, "Admin deleted successfully"));
});