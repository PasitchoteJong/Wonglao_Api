import { prisma } from "../../lib/prisma.js";


export const getProfileByUserId = async (userId) => {
    return await prisma.user.findUnique({
        where: { Id: userId, },
        select: {
            Id: true,
            LineUserId: true,
            DisplayName: true,
            ProfileImage: true,
            Email: true,
            BirthDay: true,
            QRpayment: true,
            PromptPay: true,
            CreatedAt: true,
            UpdatedAt: true,
        },
    });
};


export const updateProfileByUserId = async (userId, data) => {
    return await prisma.user.update({
        where: { Id: userId, },
        data,
        select: {
            Id: true,
            LineUserId: true,
            DisplayName: true,
            ProfileImage: true,
            Email: true,
            BirthDay: true,
            QRpayment: true,
            PromptPay: true,
            CreatedAt: true,
            UpdatedAt: true,
        },
    });
};