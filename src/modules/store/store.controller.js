
import { asyncHandler } from "../../core/utils/async-handler.js";
import Store from "../../models/Store.model.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";


// ✅ Create Store
export const createStore = asyncHandler(async (req, res) => {
  const { storeName, storeDescription, idCardNumber, storeCategoryId } = req.body;
  const userID = req.user?._id;

  if (!storeName || !idCardNumber)
    throw new ApiError(400, "Store name and ID card number are required");

  let storeLogo = null;
  let idCardImage = null;

  // ✅ Upload store logo
  if (req.files?.storeLogo?.[0]) {
    const upload = await S3UploadHelper.uploadFile(req.files.storeLogo[0], "store-logos");
    storeLogo = upload.key; // store only string key
  }

  // ✅ Upload ID card image
  if (req.files?.idCardImage?.[0]) {
    const upload = await S3UploadHelper.uploadFile(req.files.idCardImage[0], "store-idcards");
    idCardImage = upload.key; // store only string key
  }

  const store = await Store.create({
    userID,
    storeName,
    storeDescription,
    idCardNumber,
    storeCategoryId,
    storeLogo,
    idCardImage,
  });

  return res.status(201).json(new ApiResponse(201, store, "Store created successfully!"));
});

// ✅ Update Store
export const updateStore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { storeName, storeDescription, storeCategoryId } = req.body;

  const store = await Store.findById(id);
  if (!store) throw new ApiError(404, "Store not found");

  if (store.userID.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not authorized to update this store");

  // ✅ Update Logo if new one provided
  if (req.files?.storeLogo?.[0]) {
    if (store.storeLogo) await S3UploadHelper.deleteFile(store.storeLogo);
    const upload = await S3UploadHelper.uploadFile(req.files.storeLogo[0], "store-logos");
    store.storeLogo = upload.key;
  }

  // ✅ Update ID Card if new one provided
  if (req.files?.idCardImage?.[0]) {
    if (store.idCardImage) await S3UploadHelper.deleteFile(store.idCardImage);
    const upload = await S3UploadHelper.uploadFile(req.files.idCardImage[0], "store-idcards");
    store.idCardImage = upload.key;
  }

  store.storeName = storeName || store.storeName;
  store.storeDescription = storeDescription || store.storeDescription;
  store.storeCategoryId = storeCategoryId || store.storeCategoryId;

  await store.save();

  return res.status(200).json(new ApiResponse(200, store, "Store updated successfully"));
});

// ✅ Admin changes store status
export const changeStoreStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "live", "rejected"].includes(status))
    throw new ApiError(400, "Invalid status");

  const store = await Store.findById(id);
  if (!store) throw new ApiError(404, "Store not found");

  store.storeStatus = status;
  await store.save();

  return res.status(200).json(new ApiResponse(200, store, `Store status changed to ${status}`));
});

// ✅ Get All Stores (Admin or Listing)
export const getAllStores = asyncHandler(async (req, res) => {
  const stores = await Store.find()
    .populate("userID", "userName userEmail")
    .populate("storeCategoryId", "categoryName");

  return res.status(200).json(new ApiResponse(200, stores, "All stores fetched successfully"));
});
// ✅ Get Single Store by ID
export const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    throw new ApiError(404, "Store not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, store, "Store fetched successfully"));
});

