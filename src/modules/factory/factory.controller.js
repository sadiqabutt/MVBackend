

import Factory from "../../models/Factory.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

// 🟢 Register Factory (Factory Owner)
export const createFactory = asyncHandler(async (req, res) => {
  const { userID, factoryName, factoryDescription, factoryCategoryId, licenseNumber } = req.body;

  if (!userID || !factoryName || !licenseNumber) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  let factoryLogoUrl = null;
  let factoryLicenseUrl = null;

  if (req.files?.factoryLogo?.[0]) {
    const upload = await S3UploadHelper.uploadFile(req.files.factoryLogo[0], "factory/logos");
    factoryLogoUrl = upload.key;
  }

  if (req.files?.factoryLicenseImage?.[0]) {
    const upload = await S3UploadHelper.uploadFile(req.files.factoryLicenseImage[0], "factory/licenses");
    factoryLicenseUrl = upload.key;
  }

  const factory = await Factory.create({
    userID,
    factoryName,
    factoryDescription,
    factoryCategoryId,
    licenseNumber,
    factoryLogo: factoryLogoUrl,
    factoryLicenseImage: factoryLicenseUrl,
    factoryStatus: "pending", // default pending
  });

  res.status(201).json({
    success: true,
    message: "Factory registered successfully (pending admin approval)",
    data: factory,
  });
});

// 🟡 Update Factory (Factory Owner)
export const updateFactory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const factory = await Factory.findById(id);
  if (!factory) return res.status(404).json({ success: false, message: "Factory not found" });

  // Check ownership
  if (factory.userID.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized to update this factory" });
  }

  if (req.files?.factoryLogo?.[0]) {
    if (factory.factoryLogo) await S3UploadHelper.deleteFile(factory.factoryLogo);
    const upload = await S3UploadHelper.uploadFile(req.files.factoryLogo[0], "factory/logos");
    factory.factoryLogo = upload.key;
  }

  if (req.files?.factoryLicenseImage?.[0]) {
    if (factory.factoryLicenseImage) await S3UploadHelper.deleteFile(factory.factoryLicenseImage);
    const upload = await S3UploadHelper.uploadFile(req.files.factoryLicenseImage[0], "factory/licenses");
    factory.factoryLicenseImage = upload.key;
  }

  Object.assign(factory, req.body);
  await factory.save();

  res.status(200).json({ success: true, message: "Factory updated successfully", data: factory });
});

// 🔴 Delete Factory (Factory Owner)
export const deleteFactory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const factory = await Factory.findById(id);
  if (!factory) return res.status(404).json({ success: false, message: "Factory not found" });

  // Check ownership
  if (factory.userID.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized to delete this factory" });
  }

  if (factory.factoryLogo) await S3UploadHelper.deleteFile(factory.factoryLogo);
  if (factory.factoryLicenseImage) await S3UploadHelper.deleteFile(factory.factoryLicenseImage);

  await factory.deleteOne();
  res.status(200).json({ success: true, message: "Factory deleted successfully" });
});

// 🟢 Get All Factories
export const getAllFactories = asyncHandler(async (req, res) => {
  const factories = await Factory.find()
    .populate("userID", "userName email")
    .populate("factoryCategoryId", "name");

  // Convert S3 keys to full URLs if needed
  const factoriesWithUrls = factories.map(f => ({
    ...f.toObject(),
    factoryLogo: f.factoryLogo ? `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${f.factoryLogo}` : null,
    factoryLicenseImage: f.factoryLicenseImage ? `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${f.factoryLicenseImage}` : null,
  }));

  res.status(200).json({ success: true, message: "All factories fetched", data: factoriesWithUrls });
});

// 🟢 Get Factory By ID
export const getFactoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const factory = await Factory.findById(id)
    .populate("userID", "userName email")
    .populate("factoryCategoryId", "name");

  if (!factory) return res.status(404).json({ success: false, message: "Factory not found" });

  const factoryWithUrls = {
    ...factory.toObject(),
    factoryLogo: factory.factoryLogo ? `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${factory.factoryLogo}` : null,
    factoryLicenseImage: factory.factoryLicenseImage ? `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${factory.factoryLicenseImage}` : null,
  };

  res.status(200).json({ success: true, data: factoryWithUrls });
});

// 🟣 Admin: Approve / Reject Factory
export const changeFactoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { factoryStatus } = req.body; // "approved" | "rejected"

  const factory = await Factory.findById(id);
  if (!factory) return res.status(404).json({ success: false, message: "Factory not found" });

  factory.factoryStatus = factoryStatus;
  await factory.save();

  res.status(200).json({ success: true, message: `Factory ${factoryStatus} successfully`, data: factory });
});
