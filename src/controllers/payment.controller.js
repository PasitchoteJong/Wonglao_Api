import createHttpError from "http-errors";
import {
    // completeBill,
    // countUnpaidMembers,
    createPaymentSlip,
    getBillMember,
    getBillOwner,
    getMyPayment,
    getPaymentSlipById,
    getPaymentSummaryServ,
    getPaymentSummaryService,
    getPendingPaymentSlipsFromDB,
    // updateBillMemberStatus,
    // updatePaymentSlipStatus,
    verifyPaymentTransaction
} from "../services/payment.service.js";


export const getMyPaymentInfo = async (req, res, next) => {
    try {
        const { billId } = req.params;

        const payment = await getMyPayment(billId, req.user.userId);

        if (!payment) throw createHttpError(404, "Payment information not found");

        return res.status(200).json({
            message: "Payment information retrieved successfully",
            data: payment
        });
    } catch (error) {
        next(error);
    }
}

export const uploadPaymentSlip = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const userId = req.user.userId

        if (!req.file) throw createHttpError(400, "Payment slip image is required");

        const member = await getBillMember({ billId, userId });
        if (!member) throw createHttpError(404, "Bill number not found");

        if (!member.AmountToPay) throw createHttpError(400, "Amount to pay has not been calculated");

        const proofImage = `/uploads/slip/${req.file.filename}`;

        const paymentSlip = await createPaymentSlip({
            billId,
            memberId: member.Id,
            amount: member.AmountToPay,
            proofImage
        });

        return res.status(201).json({
            message: "Payment slip uploaded successful",
            data: paymentSlip
        })
    } catch (error) {
        next(error);
    }
}

export const verifyPaymentSlip = async (req, res, next) => {
    try {
        const { paymentSlipId } = req.params;
        const ownerId = req.user.userId;

        const paymentSlip = await getPaymentSlipById(paymentSlipId);
        if (!paymentSlip) throw createHttpError(404, "Payment slip not found");

        if (paymentSlip.Bill.MemberId !== ownerId) throw createHttpError(403, "Only bill owner can verify payment");

        if (paymentSlip.StatusPay === "PAID") throw createHttpError(400, "Payment slip already verified")

        // await updatePaymentSlipStatus(paymentSlipId, "PAID");

        // const member = await updateBillMemberStatus(paymentSlipId.BillMemberId, "PAID");

        // const unpaidMember = await countUnpaidMembers(paymentSlipId.BillId);
        // if (unpaidMember === 0) await completeBill(paymentSlip.BillId);

        const slipAmount = Number(paymentSlip.Amount);
        const currentAmountPaid = Number(paymentSlip.BillMember.AmountPaid || 0);
        const amountToPay = Number(paymentSlip.BillMember.AmountToPay || 0);
        const newAmountPaid = currentAmountPaid + slipAmount;


        const isFullyPaid = newAmountPaid >= amountToPay;
        const memberStatus = isFullyPaid ? "PAID" : "PENDING_VERIFY";

        // Update all related data in one transaction
        const member = await verifyPaymentTransaction({
            paymentSlipId,
            billMemberId: paymentSlip.BillMemberId,
            billId: paymentSlip.BillId,
            amountPaid: newAmountPaid,
            slipStatus: "PAID",
            memberStatus
        });


        res.status(200).json({
            message: "Payment slip verified successful",
            data: member
        })
    } catch (error) {
        next(error);
    }


}


export const getPendingPaymentSlips = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const ownerId = req.user.userId;

        const bill = await getBillOwner(billId);

        if (!bill) throw createHttpError(404, "Bill not found");


        if (bill.MemberId !== ownerId) throw createHttpError(403, "Only bill owner can view payment slips");


        const paymentSlips = await getPendingPaymentSlipsFromDB(billId);

        return res.status(200).json({
            message: "Get pending payment slips successful",
            data: paymentSlips
        });

    } catch (error) {
        next(error);
    }
};

export const getPaymentSummary = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 5;

        if (page < 1) page = 1;

        if (limit < 1 || limit > 50) limit = 5;

        const { bills, total } = await getPaymentSummaryService({ userId, page, limit });

        const totalPages = Math.ceil(total / limit);

        const data = bills.map((bill) => {
            const members = bill.Billmember.map((member) => {
                const amountToPay = Number(member.AmountToPay || 0);
                const amountPaid = Number(member.AmountPaid || 0);
                const remainingAmount = Math.max(amountToPay - amountPaid, 0);

                return {
                    id: member.Id,
                    userId: member.UserId,
                    displayName: member.DisplayName,
                    amountToPay,
                    amountPaid,
                    remainingAmount,
                    statusPay: member.StatusPay,
                    paymentAccepted: member.PaymentAccepted,
                    joinAt: member.JoinAt,
                    slips: member.PaymentSlip
                };
            });

            return {
                billId: bill.Id,
                shopName: bill.ShopName,
                totalAmount: Number(bill.TotalAmount || 0),
                statusReceipt: bill.StatusReceipt,
                createdAt: bill.CreatedAt,
                members
            };
        });

        return res.status(200).json({
            message: "Payment summary retrieved successfully",
            pagination: {
                page,
                limit,
                total,
                totalPages
            },
            data
        });

    } catch (error) {
        next(error);
    }
};

export const getPaymentSummaryInfo = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const userId = req.user.userId;

        const bill = await getPaymentSummaryServ(billId);

        if (!bill) throw createHttpError(404, "Bill not found")

        if (bill.MemberId !== userId) throw createHttpError(403, "Only bill owner can view payment summary")

        const members = bill.Billmember.map((member) => {
            const amountToPay = Number(member.AmountToPay ?? 0)
            const amountPaid = Number(member.AmountPaid ?? 0)

            const remainingAmount = Math.max(amountToPay - amountPaid, 0)

            return {
                Id: member.Id,
                UserId: member.UserId,
                DisplayName: member.DisplayName,
                AmountToPay: amountToPay,
                AmountPaid: amountPaid,
                remainingAmount: remainingAmount,
                PaymentAccepted: member.PaymentAccepted,
                StatusPay: member.StatusPay,
                LastPaymentAt: member.PaymentSlip[0]?.CreatedAt ?? null
            }
        });

        const summary = {
            BillId: bill.Id,
            ShopName: bill.ShopName,
            TotalAmount: Number(
                bill.TotalAmount ?? 0
            ),
            Members: members
        }

        return res.status(200).json({
            message: "Payment summary retrieved successful",
            data: summary
        });
    } catch (error) {
        next(error)
    }

};

export const getPaymentMemberDetailInfo = async (req, res, next) => {
    try {
        const { billId, billMemberId } = req.params;
        const userId = req.user.userId;
        const { bill, member } = await getPaymentMemberDetail(billId, billMemberId);

        if (!bill) throw createHttpError(404, "Bill not found");
        if (bill.MemberId !== userId) throw createHttpError(403, "Only bill owner can view payment details");
        if (!member) throw createHttpError(404, "Bill member not found");

        // Business logic
        const amountToPay = Number(member.AmountToPay ?? 0);
        const amountPaid = Number(member.AmountPaid ?? 0);
        const remainingAmount = Math.max(amountToPay - amountPaid, 0);

        const paymentSlips =
            member.PaymentSlip.map((slip) => ({
                ...slip,
                Amount: Number(slip.Amount)
            }));

        const detail = {
            Id: member.Id,
            DisplayName: member.DisplayName,
            AmountToPay: amountToPay,
            AmountPaid: amountPaid,
            RemainingAmount: remainingAmount,
            PaymentAccepted: member.PaymentAccepted,
            StatusPay: member.StatusPay,
            PaymentSlips: paymentSlips
        };

        return res.status(200).json({
            message: "Payment details retrieved successfully",
            data: detail
        });
    } catch (error) {
        next(error);
    }
};