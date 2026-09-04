import createHttpError from "http-errors";
import { extractTextFromReceipt } from "../services/ocr.service.js";
import { structureReceiptText } from "../services/gemini.service.js";
import { saveOCRResultToBill } from "../services/bill.service.js";

export const ocrReceipt = async (req, res, next) => {
    try {
        const { imagePath } = req.body;
        console.log("imagePath:", imagePath)

        if (!imagePath) {
            throw createHttpError(400, "imagePath is required");
        }

        const ocrText = await extractTextFromReceipt(imagePath);
        console.log("ocrText:", ocrText)

        const structureData = await structureReceiptText(ocrText)
        console.log("structureData", structureData)

        return res.status(200).json({
            success: true,
            ocrText,
            data: structureData
        });

    } catch (error) {
        console.error("OCR Controller Error:", error);
        next(error);
    }
};

export const saveOCRResult = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const data = req.body;

        if (!billId) {
            throw createHttpError(400, "Bill ID is required");
        }

        if (!data.shopName) {
            throw createHttpError(400, "Shop name is required");
        }

        if (!data.items || !Array.isArray(data.items)) {
            throw createHttpError(400, "Items must be an array");
        }

        const bill = await saveOCRResultToBill(billId, data);

        res.status(200).json({
            success: true,
            message: "OCR result saved successfully",
            data: bill
        });

    } catch (error) {
        next(error);
    }
};