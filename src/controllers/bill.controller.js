import createHttpError from "http-errors";
import { createBillInDB, getBillForVerification, saveOCRResultToBill } from "../services/bill.service.js";
// import { extractTextFromReceipt } from "../services/ocr.service.js";
// import { structureReceiptText } from "../services/gemini.service.js";
import { prisma } from "../../lib/prisma.js";
import { createBillmember, getExistingMember } from "../services/joinBill.service.js";
// import path from "path";
import { uploadReceipt } from "../services/storage.service.js";


/**
 * Create a new bill and automatically process receipt OCR in the background
 */
export const createBill = async (req, res, next) => {
    try {
        // console.log(req.body)
        const { billName } = req.body;
        // console.log(billName)

        if (!billName) throw createHttpError(400, "Bill name is required");

        const receiptImage = await uploadReceipt(req.file);
        if (!receiptImage) throw createHttpError(400, "Receipt image is required");

        // console.log("REQ.USER =", req.user);
        // console.log("MEMBER ID =", req.user?.userId);

        // 1. Create initial bill record in the database
        const newBill = await createBillInDB({
            memberId: req.user?.userId,
            shopName: billName,
            receiptImage: receiptImage,
        });

        // // 2. If receipt image exists, process OCR and structure text via Gemini in the background
        // try {
        //     const absolutePath = path.join(process.cwd(), receiptImage);
        //     const ocrText = await extractTextFromReceipt(absolutePath);

        //     if (ocrText) {
        //         const structureData = await structureReceiptText(ocrText);

        //         // 3. Save OCR results (shop name, total amount, items) to the bill
        //         if (structureData) {
        //             await saveOCRResultToBill(newBill.Id, {
        //                 shopName: structureData.shopName || billName,
        //                 totalAmount: structureData.totalAmount || 0,
        //                 items: structureData.items || []
        //             });
        //         }
        //     }
        // } catch (ocrError) {
        //     console.error("Auto OCR Processing Warning:", ocrError);
        //     // Skip OCR errors to prevent blocking bill creation
        // }

        // Retrieve the latest bill data including updated OCR items
        // const finalBill = await prisma.bill.findUnique({
        //     where: { Id: newBill.Id },
        //     include: { BillItem: true }
        // });

        return res.status(201).json({
            message: "Bill created successfully",
            bill: newBill
            // bill: finalBill
        });

    } catch (error) {
        console.error("Create Bill Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to create bill"));
    }
};

/**
 * Get bill details by ID including its items
 */
export const getBillById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const bill = await prisma.bill.findUnique({
            where: { Id: id },
            include: { BillItem: true }
        });

        if (!bill) throw createHttpError(404, "Bill not found");

        return res.status(200).json({ bill });
    } catch (error) {
        console.error("Get Bill Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to get bill"));
    }
};

/**
 * Verify and update bill details manually
 */
export const verifyBill = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { shopName, totalAmount } = req.body;
        const user = req.user

        // console.log("USER:", req.user);
        // console.log("BILL ID:", id);

        const bill = await getBillForVerification(id);
        if (!bill) throw createHttpError(404, "Bill not found");
        if (!bill.BillItem || bill.BillItem.length === 0) throw createHttpError(400, "Bill items are required");



        const itemSubtotal = bill.BillItem.reduce((sum, item) => {
            return sum + Number(item.CostTotal || 0);
        }, 0);

        const finalTotal = Number(totalAmount);

        if (itemSubtotal <= 0) throw createHttpError(400, "Bill item subtotal must be greater than 0");
        if (!finalTotal || finalTotal <= 0) throw createHttpError(400, "Total amount must be greater than 0");



        const difference = finalTotal - itemSubtotal;
        const differencePercent = (difference / itemSubtotal) * 100;
        // ยอดตรงกับรายการอาหาร
        const sameTotal = Math.abs(difference) <= 0.01;
        // ยอดสูงกว่าประมาณ VAT 7%
        const looksLikeVat = differencePercent >= 6.5 && differencePercent <= 7.5;

        if (!sameTotal && !looksLikeVat) {
            throw createHttpError(
                400,
                `Total amount does not match items subtotal. ` +
                `Items: ฿${itemSubtotal.toFixed(2)}, ` +
                `Total: ฿${finalTotal.toFixed(2)}`
            );
        }


        const updatedBill = await saveOCRResultToBill(id, {
            shopName,
            totalAmount: finalTotal,

            // ให้ระบบเป็นคนตรวจเอง
            vat: looksLikeVat,

            items: [],
            StatusReceipt: "VERIFIED"
        });

        let member;
        const existingMember = await getExistingMember(id, user.userId);
        if (!existingMember) {
            const payloadMember = {
                billId: id,
                userId: user.userId,
                displayName: user.displayName
            };

            member = await createBillmember(payloadMember);
        }

        return res.status(200).json({
            message: "Bill verified successful",

            validation: {
                itemSubtotal: Number(itemSubtotal.toFixed(2)),
                totalAmount: Number(finalTotal.toFixed(2)),
                vatDetected: looksLikeVat,
                differencePercent: Number(
                    differencePercent.toFixed(2)
                )
            },

            bill: updatedBill,
            data: member || "You have already joined this bill."
        });

    } catch (error) {
        console.error("Verify Bill Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to verify bill"));
    }
};

/**
 * Update/Edit bill items manually (useful for correcting incorrect OCR data)
 */
export const updateBillItems = async (req, res, next) => {
    try {
        const { id: billId } = req.params;
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            throw createHttpError(400, "Items array is required");
        }

        const bill = await prisma.bill.findUnique({ where: { Id: billId } });
        if (!bill) {
            throw createHttpError(404, "Bill not found");
        }

        // Use transaction to replace old items with the corrected ones safely
        await prisma.$transaction(async (tx) => {
            await tx.billItem.deleteMany({
                where: { BillId: billId }
            });

            if (items.length > 0) {
                const newItemsData = items.map(item => ({
                    BillId: billId,
                    Name: item.name,
                    Price: parseFloat(item.price) || 0,
                    Quantity: parseInt(item.quantity) || 1,
                    CostTotal: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
                }));

                await tx.billItem.createMany({
                    data: newItemsData
                });
            }
        });

        const updatedBill = await prisma.bill.findUnique({
            where: { Id: billId },
            include: { BillItem: true }
        });

        return res.status(200).json({
            message: "Bill items updated successfully",
            bill: updatedBill
        });
    } catch (error) {
        console.error("Update Bill Items Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to update bill items"));
    }
};


