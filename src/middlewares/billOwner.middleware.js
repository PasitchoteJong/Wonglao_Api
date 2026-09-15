import createHttpError from "http-errors";
import { getBillByBillId } from "../services/bill.service.js";

export const billOwnerMiddleware = async (req, res, next) => {
    try {
        const { billId } = req.params;

        const bill = await getBillByBillId(billId);
        if (!bill) throw createHttpError(404, "Bill not found");
        if (bill.MemberId !== req.user.userId) throw createHttpError(403, "Only bill owner can perform this action");


        req.bill = bill;

        next();

    } catch (error) {
        next(error);
    }
};