import { prisma } from "../../lib/prisma.js"

export const findUserByLineId = async (lineUserId) => {
    return await prisma.user.findUnique({
        where: {
            LineUserId: lineUserId
        }
    });
};

export const createUser = async ({ lineUserId, displayName, profileImage, email, birthDay, qrPayment, promtpay }) => {
    return await prisma.user.create({
        data: {
            LineUserId: lineUserId,
            DisplayName: displayName,
            ProfileImage: profileImage,
            Email: email,
            BirthDay: birthDay,
            QRpayment: qrPayment,
            PromptPay: promtpay
        }
    });
};