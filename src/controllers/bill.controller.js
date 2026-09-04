import createHttpError from "http-errors";
import { createBillInDB } from "../services/bill.service.js";

export const createBill = async (req, resizeBy, next) => {
    try{
        const { billName } = req.body
        const receiptImage = req.file
            ? `/uploads/receipts/${req.file.filename}`
            : null

        console.log("BODY:", req.body)
        console.log("FILE:", req.file)

        if (!billName) {
            throw createHttpError(400, "Bill name is required")
        }

        if (!receiptImage) {
            throw createHttpError(400, "Receipt image is required")
        }

        const newBill = await createBillInDB({
            memberId: req.user?.userId || req.user?.id,
            shopName: billName,
            receiptImage: receiptImage,
        })

        return res.status(201).json({
            message: "Bill created",
            bill: newBill
        })
    } catch (error) {
        console.error("Create Bill Error:", error)
        next(error.status ? error : createHttpError(500, "Failed to create bill"))
    }
}