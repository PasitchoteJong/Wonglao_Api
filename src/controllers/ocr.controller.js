import createHttpError from "http-errors";
import { extractTextFromReceipt } from "../services/ocr.service.js";
import { structureReceiptText } from "../services/gemini.service.js";
import { getBillByBillId, saveOCRResultToBill } from "../services/bill.service.js";
import path from "path";



// export const ocrReceipt = async (req, res, next) => {
//     try {
//         const { imagePath } = req.body;
//         console.log("imagePath:", imagePath)

//         if (!imagePath) {
//             throw createHttpError(400, "imagePath is required");
//         }

//         const ocrText = await extractTextFromReceipt(imagePath);
//         console.log("ocrText:", ocrText)

//         const structureData = await structureReceiptText(ocrText)
//         console.log("structureData", structureData)

//         return res.status(200).json({
//             success: true,
//             ocrText,
//             data: structureData
//         });

//     } catch (error) {
//         console.error("OCR Controller Error:", error);
//         next(error);
//     }
// };

export const saveOCRResult = async (req, res, next) => {
    try {
        const { billId } = req.params;

        // const data = req.body;
        const bill = await getBillByBillId(billId);
        console.log("Bill OCR Controller:", bill)

        if (!bill) { throw createHttpError(400, "Bill not found") }

        if (!bill.ReceiptImage) { throw createHttpError(400, "Receipt image not found") }

        // if (!data.items || !Array.isArray(data.items)) {
        //     throw createHttpError(400, "Items must be an array");
        // }

        const absolutePath = path.join(
            process.cwd(),
            bill.ReceiptImage
        );

        const ocrText = await extractTextFromReceipt(absolutePath);
        if (!ocrText) { throw createHttpError(400, "OCR cound not extract text") }

        const structureData = await structureReceiptText(ocrText)
        if (!structureData) { throw createHttpError(400, "Failed to structure receipt data") }

        const updateBill = await saveOCRResultToBill(billId, {
            shopName: structureData.shopName || bill.ShopName,
            totalAmount: structureData.totalAmount || 0,
            items: structureData.items || []
        });


        res.status(200).json({
            message: "OCR processed successfully",
            data: updateBill
        });

    } catch (error) {
        console.error("OCR Error:", error);
        next(error);
    }
};