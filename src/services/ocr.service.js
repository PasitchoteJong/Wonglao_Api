import { createWorker } from "tesseract.js";

export const extractTextFromReceipt = async (imagePath) => {
    const worker = await createWorker("tha+eng");

    try {
        const result = await worker.recognize(imagePath);

        return result.data.text;
    } finally {
        await worker.terminate();
    }
};