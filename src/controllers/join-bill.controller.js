import createHttpError from "http-errors";

import { getBillByBillId } from "../services/bill.service.js";

import {
    createBillmember,
    getExistingMember,
    getJoinBillService,
    getJoinUserProfile,
    reactivateBillMember,
    leaveBillMember,
    getBillMemberById,
    removeBillMember,
} from "../services/joinBill.service.js";


export const joinBill = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const userId = req.user.userId;

        // =========================
        // Check Bill
        // =========================

        const bill = await getBillByBillId(billId);

        if (!bill) {
            throw createHttpError(404, "Bill not found");
        }


        // =========================
        // Get User Profile
        // =========================

        const user = await getJoinUserProfile(userId);

        if (!user) {
            throw createHttpError(404, "User not found");
        }

        if (!user.DisplayName) {
            throw createHttpError(
                400,
                "User display name not found"
            );
        }


        // =========================
        // Check Existing Member
        // =========================

        const existingMember =
            await getExistingMember(
                billId,
                userId
            );


        // ยัง JOINED อยู่
        if (
            existingMember &&
            existingMember.StatusMember === "JOINED"
        ) {
            return res.status(200).json({
                message:
                    "User already joined this bill",
                data: existingMember,
            });
        }


        // เคยออกจากกลุ่มไปแล้ว
        // ให้กลับเข้ามาใหม่
        if (existingMember) {

            const member =
                await reactivateBillMember({
                    memberId:
                        existingMember.Id,

                    displayName:
                        user.DisplayName,
                });

            return res.status(200).json({
                message:
                    "Rejoined bill successfully",

                data: member,
            });
        }


        // =========================
        // New Member
        // =========================

        const member =
            await createBillmember({
                billId,
                userId,
                displayName:
                    user.DisplayName,
            });


        return res.status(201).json({
            message:
                "Join Bill successful",

            data: member,
        });

    } catch (error) {
        next(error);
    }
};



export const getJoinBill = async (
    req,
    res,
    next
) => {
    try {

        const { billId } = req.params;

        const userId =
            req.user.userId;


        const bill =
            await getJoinBillService(
                billId
            );


        if (!bill) {
            throw createHttpError(
                404,
                "Bill not found"
            );
        }


        // =========================
        // Business Logic
        // =========================

        const isOwner =
            bill.MemberId === userId;


        const members =
            bill.Billmember.map(
                (member) => ({
                    ...member,

                    isMe:
                        member.UserId ===
                        userId,

                    isOwner:
                        member.UserId ===
                        bill.MemberId,
                })
            );


        return res.status(200).json({
            message:
                "Get join bill successful",

            data: {
                Id: bill.Id,

                ShopName:
                    bill.ShopName,

                TotalAmount:
                    bill.TotalAmount,

                StatusReceipt:
                    bill.StatusReceipt,

                CreatedAt:
                    bill.CreatedAt,

                ownerId:
                    bill.MemberId,

                isOwner,

                memberCount:
                    members.length,

                Billmember:
                    members,
            },
        });

    } catch (error) {
        next(error);
    }
};



export const leaveJoinBill = async (
    req,
    res,
    next
) => {
    try {

        const { billId } =
            req.params;

        const userId =
            req.user.userId;


        const bill =
            await getBillByBillId(
                billId
            );


        if (!bill) {
            throw createHttpError(
                404,
                "Bill not found"
            );
        }


        // Owner ห้ามออกจาก Bill ตัวเอง
        if (
            bill.MemberId === userId
        ) {
            throw createHttpError(
                400,
                "Bill owner cannot leave own bill"
            );
        }


        const result =
            await leaveBillMember({
                billId,
                userId,
            });


        if (result.count === 0) {
            throw createHttpError(
                404,
                "Member not found"
            );
        }


        return res.status(200).json({
            message:
                "Leave bill successful",
        });

    } catch (error) {
        next(error);
    }
};



export const ownerRemoveMember = async (
    req,
    res,
    next
) => {
    try {

        const {
            billId,
            memberId,
        } = req.params;


        const member =
            await getBillMemberById({
                billId,
                memberId,
            });


        if (!member) {
            throw createHttpError(
                404,
                "Member not found"
            );
        }


        // Owner ห้ามลบตัวเอง
        if (
            member.UserId ===
            req.user.userId
        ) {
            throw createHttpError(
                400,
                "Bill owner cannot remove themselves"
            );
        }


        await removeBillMember({
            billId,
            memberId,
        });


        return res.status(200).json({
            message:
                "Member removed successfully",
        });

    } catch (error) {
        next(error);
    }
};