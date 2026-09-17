import axios from "axios";
import { createWorker } from "tesseract.js";

export const extractTextFromReceipt = async (imageUrl) => {
    const worker = await createWorker("tha+eng");

    try {
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
        });

        const imageBuffer = Buffer.from(response.data);

        const result = await worker.recognize(imageBuffer);

        return result.data.text;
    } finally {
        await worker.terminate();
    }
};