import { asyncHandler } from "../../core/utils/async-handler.js";

const storeLoginCookies = asyncHandler(async (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production", // use true only in prod
        sameSite: "strict",
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
})

const storeAccessToken = asyncHandler(async (res, accessToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production", // use true only in prod
        sameSite: "strict",
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
})

export { storeLoginCookies, storeAccessToken };