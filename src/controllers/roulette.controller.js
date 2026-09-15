import createHttpError from "http-errors";

import {
    getRouletteByBillId,
    submitRouletteToDatabase,
    createRouletteSpin,
    getRouletteParticipants,
    getBillOwner,
    getBillMemberForRoulette,
    updateRouletteEligible,
    getRouletteBill,
    updateRouletteResult
} from "../services/roulette.service.js";

export const updateRouletteEligibility = async (req, res, next) => {
    try {
        const { billId, billMemberId } = req.params;
        const { eligible } = req.body;
        const ownerId = req.user.userId;

        if (typeof eligible !== "boolean") throw createHttpError(400, "Eligible must be a boolean");

        const bill = await getBillOwner(billId);
        if (!bill) throw createHttpError(404, "Bill not found");

        //if (bill.MemberId !== ownerId) throw createHttpError(403, "Only bill owner can manage roulette members");

        const member = await getBillMemberForRoulette({ billId, billMemberId });
        if (!member) throw createHttpError(404, "Bill member not found");


        const updatedMember = await updateRouletteEligible({
            billMemberId: member.Id,
            rouletteEligible: eligible
        });

        return res.status(200).json({
            message: eligible
                ? "Member joined the roulette"
                : "Member removed from the roulette",

            data: {
                billMemberId: updatedMember.Id,
                userId: updatedMember.UserId,
                displayName: updatedMember.DisplayName,
                rouletteEligible: updatedMember.RouletteEligible
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /roulette/:billId
export const getRoulette = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const roulette = await getRouletteByBillId(billId);
        if (!roulette) throw createHttpError(404, "Roulette not found");


        const isOwner = roulette.Bill.MemberId === req.user.userId;

        res.status(200).json({
            roulette,
            isOwner
        });

    } catch (error) {
        next(error);
    }
};

export const updateRouletteMember = async (req, res, next) => {
    try {
        const { billId, memberId } = req.params;

        const { isJoined } = req.body;

        if (typeof isJoined !== "boolean")
            throw createHttpError(400, "isJoined must be boolean");


        const member = await updateRouletteMemberStatus(billId, memberId, isJoined);

        res.status(200).json({
            message: "Roulette member updated",
            member
        });

    } catch (error) {
        next(error);
    }
};

export const spinRoulette = async (req, res, next) => {
    try {
        const { billId } = req.params;

        const participants = await getRouletteParticipants(billId);
        if (participants.length < 2) throw createHttpError(400, "At least 2 participants are required");

        const randomIndex = Math.floor(Math.random() * participants.length);
        const winner = participants[randomIndex];
        const spin = await createRouletteSpin({ billId, winnerId: winner.Id });

        res.status(200).json({
            message: "Roulette spin completed",
            winner,
            spin
        });

    } catch (error) {
        next(error);
    }
};

export const confirmRoulettePaymentController = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const ownerId = req.user.userId;

        const bill = await getRouletteBill(billId);
        if (!bill) throw createHttpError(404, "Bill not found");
        //if (bill.MemberId !== ownerId) throw createHttpError(403, "Only bill owner can confirm payment");
        if (bill.SplitMethod !== "ROULETTE") throw createHttpError(400, "This bill does not use roulette split");


        const winner = bill.Billmember.find((member) =>
            member.AmountToPay !== null && Number(member.AmountToPay) > 0
        );
        if (!winner) throw createHttpError(400, "Roulette has not been spun yet");
        if (winner.StatusPay === "PAID") throw createHttpError(400, "Winner payment has already been confirmed");


        const amountPaid = Number(winner.AmountToPay);

        const updatedWinner = await confirmRoulettePayment({
            billId,
            billMemberId: winner.Id,
            amountPaid
        });

        return res.status(200).json({
            message: "Roulette payment confirmed successfully",
            data: {
                billMemberId: updatedWinner.Id,
                userId: updatedWinner.UserId,
                displayName: updatedWinner.DisplayName,
                amountToPay: Number(updatedWinner.AmountToPay),
                amountPaid: Number(updatedWinner.AmountPaid),
                statusPay: updatedWinner.StatusPay,
                paymentAccepted: updatedWinner.PaymentAccepted
            }
        });

    } catch (error) {
        next(error);
    }
};