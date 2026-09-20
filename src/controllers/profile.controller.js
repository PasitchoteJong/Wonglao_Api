import createHttpError from "http-errors";
import {
    getProfileByUserId,
    updateProfileByUserId,
} from "../services/profile.service.js";
import {
    uploadProfileImage,
    uploadQRPaymentImage,
} from "../services/profileStorage.service.js";



export const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await getProfileByUserId(userId);

        if (!user) throw createHttpError(404, "User not found");

        return res.status(200).json({
            message: "Profile retrieved successfully",
            data: user,
        });

    } catch (error) {
        next(error);
    }
};


export const updateMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const currentUser = await getProfileByUserId(userId);

        if (!currentUser) throw createHttpError(404, "User not found");

        const { displayName, email, birthDay, promptPay, } = req.body;

        if (displayName !== undefined && !displayName.trim()) throw createHttpError(400, "Display name cannot be empty");
        if (email && !email.includes("@")) throw createHttpError(400, "Invalid email");


        const updateData = {};
        if (displayName !== undefined) updateData.DisplayName = displayName.trim();
        if (email !== undefined) updateData.Email = email.trim() || null;
        if (promptPay !== undefined) updateData.PromptPay = promptPay.trim() || null;
        if (birthDay !== undefined) {
            if (!birthDay) {
                updateData.BirthDay = null;
            } else {
                const parsedBirthDay = new Date(`${birthDay}T00:00:00.000Z`);

                if (Number.isNaN(parsedBirthDay.getTime())) throw createHttpError(400, "Invalid birth day");

                updateData.BirthDay = parsedBirthDay;
            }
        }

        const profileImageFile = req.files?.profileImage?.[0];
        if (profileImageFile) {
            const imageUrl = await uploadProfileImage(profileImageFile, userId);

            updateData.ProfileImage = imageUrl;
        }

        const qrPaymentFile = req.files?.qrPayment?.[0];
        if (qrPaymentFile) {
            const qrUrl = await uploadQRPaymentImage(qrPaymentFile, userId);

            updateData.QRpayment = qrUrl;
        }

        if (Object.keys(updateData).length === 0) throw createHttpError(400, "No profile data to update");

        const updatedUser = await updateProfileByUserId(userId, updateData);


        return res.status(200).json({
            message: "Profile updated successfully",
            data: updatedUser,
        });

    } catch (error) {
        next(error);
    }
};