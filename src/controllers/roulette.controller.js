import createHttpError from "http-errors";

import {
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

        if (bill.MemberId !== ownerId) throw createHttpError(403, "Only bill owner can manage roulette members");

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

export const spinRoulette = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const ownerId = req.user.userId;

        console.log("BillId roulette:", billId)
        console.log("OwnerId:", ownerId)


        const bill = await getRouletteBill(billId);

        console.log("bill:", bill)

        if (!bill) throw createHttpError(404, "Bill not found");
        if (bill.MemberId !== ownerId) throw createHttpError(403, "Only bill owner can spin roulette");
        if (bill.SplitMethod !== "ROULETTE") throw createHttpError(400, "This bill does not use roulette split");
        if (!bill.TotalAmount) throw createHttpError(400, "Bill total amount is missing");

        const members = bill.Billmember;
        if (members.length === 0) throw createHttpError(400, "No members joined this bill");
        console.log("members roulette:", members)


        const rouletteAlreadySpun = members.some((member) =>
            member.AmountToPay !== null && Number(member.AmountToPay) > 0
        );
        if (rouletteAlreadySpun) throw createHttpError(400, "Roulette has already been spun");
        console.log("rouletteAlreadySpun Roulette:", rouletteAlreadySpun)

        const eligibleMembers = members.filter(
            (member) => member.RouletteEligible === true
        );
        if (eligibleMembers.length === 0) throw createHttpError(400, "No members are eligible for roulette");
        console.log("eligibleMembers Roulette", eligibleMembers)

        const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
        const winner = eligibleMembers[randomIndex];
        const totalAmount = Number(bill.TotalAmount);
        const updatedWinner = await updateRouletteResult({
            billId,
            winnerId: winner.Id,
            totalAmount
        });

        return res.status(200).json({
            message: "Roulette completed successfully",
            data: {
                billMemberId: updatedWinner.Id,
                userId: updatedWinner.UserId,
                displayName: updatedWinner.DisplayName,
                amountToPay: Number(updatedWinner.AmountToPay),
                statusPay: updatedWinner.StatusPay
            }
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
        if (bill.MemberId !== ownerId) throw createHttpError(403, "Only bill owner can confirm payment");
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