import createHttpError from "http-errors";
import {
    completeBill,
    countUnpaidMembers,
    createPaymentSlip,
    getBillMember,
    getPaymentSlipById,
    updateBillMemberStatus,
    updatePaymentSlipStatus
} from "../services/payment.service";


export const getMyPaymentInfo = async (req, resizeBy, next) => {
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

        if (!member.AmountToPay) throw (400, "Amount to pay has not been calculated");

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

export const verifyPaymentSlip = async (erq, res, next) => {
    try {
        const { paymentSlipId } = req.params;
        const ownerId = req.user.userId;

        const paymentSlip = await getPaymentSlipById(paymentSlipId);
        if (!paymentSlip) throw createHttpError(404, "Payment slip not found");

        if (paymentSlip.Bill.MemberId !== ownerId) throw createHttpError(403, "Only bill owner can verify payment");

        await updatePaymentSlipStatus(paymentSlipId, "PAID");

        const member = await updateBillMemberStatus(paymentSlipId.BillMemberId, "PAID");

        const unpaidMember = await countUnpaidMembers(paymentSlipId.BillId);
        if (unpaidMember === 0) await completeBill(paymentSlip.BillId);

        res.status(200).json({
            message: "Payment slip verified successful",
            data: member
        })
    } catch (error) {
        next(error);
    }


}