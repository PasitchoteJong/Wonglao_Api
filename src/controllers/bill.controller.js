import createHttpError from "http-errors";
import { createBillInDB, saveOCRResultToBill } from "../services/bill.service.js";
import { extractTextFromReceipt } from "../services/ocr.service.js";
import { structureReceiptText } from "../services/gemini.service.js";
import { prisma } from "../../lib/prisma.js";
import path from "path";

// สร้างบิล พร้อมรัน OCR อัตโนมัติ
export const createBill = async (req, res, next) => {
    try {
        const { billName } = req.body;
        const receiptImage = req.file
            ? `/uploads/receipts/${req.file.filename}`
            : null;

            // console.log("BODY:",req.body)
            // console.log("FILE:",req.file)

        if (!billName) {
            throw createHttpError(400, "Bill name is required");
        }

        if (!receiptImage) {
            throw createHttpError(400, "Receipt image is required");
        }

        // 1. สร้างบิลตั้งต้นใน DB ก่อน
        const newBill = await createBillInDB({
            memberId: req.user?.userId || req.user?.id,
            shopName: billName,
            receiptImage: receiptImage,
        });

        // 2. ถ้ารูปมีอยู่จริง ให้รัน OCR และ Gemini จัดโครงสร้างต่อทันทีแบบเบื้องหลัง
        try {
            const absolutePath = path.join(process.cwd(), receiptImage);
            const ocrText = await extractTextFromReceipt(absolutePath);
            
            if (ocrText) {
                const structureData = await structureReceiptText(ocrText);
                
                // 3. บันทึกผล OCR (ชื่อร้าน, ยอดรวม, รายการสินค้า) ลง Bill เดิมทันที
                if (structureData) {
                    await saveOCRResultToBill(newBill.Id, {
                        shopName: structureData.shopName || billName,
                        totalAmount: structureData.totalAmount || 0,
                        items: structureData.items || []
                    });
                }
            }
        } catch (ocrError) {
            console.error("Auto OCR Processing Warning:", ocrError);
            // ให้ข้ามไปได้แม้ OCR จะรันพลาด เพื่อไม่ให้บล็อกการสร้างบิลของผู้ใช้
        }

        // ดึงข้อมูลบิลล่าสุดที่อัปเดตข้อมูล OCR แล้วส่งกลับไป
        const finalBill = await prisma.bill.findUnique({
            where: { Id: newBill.Id },
            include: { BillItem: true }
        });

        return res.status(201).json({
            message: "Bill created and processed with OCR",
            bill: finalBill
        });

    } catch (error) {
        console.error("Create Bill Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to create bill"));
        // console.error("Verify Bill Error:", error);
        // next(error.status ? error : createHttpError(500, "Failed to verify bill"));
    }
}

export const getBillById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const bill = await prisma.bill.findUnique({
            where: { Id: id },
            include: { BillItem: true }
        });

        if (!bill) {
            throw createHttpError(404, "Bill not found");
        }

        return res.status(200).json({ bill });
    } catch (error) {
        console.error("Get Bill Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to get bill"));
    }
};

export const verifyBill = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { shopName, totalAmount } = req.body;

        const updatedBill = await saveOCRResultToBill(id, {
            shopName,
            totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
            items: []
        });

        return res.status(200).json({
            message: "Bill verified successfully",
            bill: updatedBill
        });
    } catch (error) {
        console.error("Verify Bill Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to verify bill"));
    }
};