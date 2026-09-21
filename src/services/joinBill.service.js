import { prisma } from "../../lib/prisma.js";

export const getExistingMember = async (billId, userId) => {
    return await prisma.billMember.findFirst({
        where: {
            BillId: billId,
            UserId: userId,
        },
    });
};

export const getJoinUserProfile = async (userId) => {
    return await prisma.user.findUnique({
        where: {
            Id: userId,
        },
        select: {
            Id: true,
            DisplayName: true,
            ProfileImage: true,
        },
    });
};

export const createBillmember = async ({
    billId,
    userId,
    displayName,
}) => {
    return await prisma.billMember.create({
        data: {
            BillId: billId,
            UserId: userId,
            DisplayName: displayName,
            StatusMember: "JOINED",
        },
    });
};

export const reactivateBillMember = async ({
    memberId,
    displayName,
}) => {
    return await prisma.billMember.update({
        where: {
            Id: memberId,
        },
        data: {
            DisplayName: displayName,
            StatusMember: "JOINED",
            IsAction: true,
        },
    });
};

export const getJoinBillService = async (billId) => {
    return await prisma.bill.findUnique({
        where: {
            Id: billId,
        },
        select: {
            Id: true,
            MemberId: true,
            ShopName: true,
            TotalAmount: true,
            StatusReceipt: true,
            CreatedAt: true,

            Billmember: {
                where: {
                    StatusMember: "JOINED",
                },
                select: {
                    Id: true,
                    UserId: true,
                    DisplayName: true,
                    StatusMember: true,
                    JoinAt: true,

                    User: {
                        select: {
                            ProfileImage: true,
                        },
                    },
                },
            },
        },
    });
};

export const leaveBillMember = async ({
    billId,
    userId,
}) => {
    return await prisma.billMember.updateMany({
        where: {
            BillId: billId,
            UserId: userId,
            StatusMember: "JOINED",
        },
        data: {
            StatusMember: "LEFT",
            IsAction: false,
        },
    });
};

export const getBillMemberById = async ({
    billId,
    memberId,
}) => {
    return await prisma.billMember.findFirst({
        where: {
            Id: memberId,
            BillId: billId,
            StatusMember: "JOINED",
        },
    });
};

export const removeBillMember = async ({
    billId,
    memberId,
}) => {
    return await prisma.billMember.updateMany({
        where: {
            Id: memberId,
            BillId: billId,
            StatusMember: "JOINED",
        },
        data: {
            StatusMember: "LEFT",
            IsAction: false,
        },
    });
};