import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export async function structureReceiptText(ocrText) {


    const prompt = `
You are an AI system specialized in analyzing Thai food receipts.

Your task is to convert OCR text from Thai food receipts, which may contain OCR errors, into structured receipt data in JSON format.

Important rules:
1. Do not create, guess, or invent any information that does not exist in the OCR text.
2. If any text or value is unclear or cannot be reliably determined, use null.
3. Try to correct Thai words that were incorrectly recognized by OCR by using the surrounding context.
4. Prices must be returned as numbers, not strings.
5. Quantity must be returned as a number.
6. Separate individual purchased items from the receipt header information.
7. Do not treat table numbers, tax identification numbers, receipt numbers, invoice numbers, phone numbers, or other identification numbers as purchased items.
8. If there are multiple total amounts, use the amount that clearly represents the grand total, such as "จำนวนรวมทั้งสิ้น", "รวมทั้งสิ้น", "ยอดรวม", or an equivalent meaning, as totalAmount.
9. If you are not confident that a particular price belongs to an item, use null instead of guessing.
10. Preserve the original meaning of Thai text. Do not translate Thai item names into English.
11. The OCR text may contain Thai characters, Thai numerals, English text, and numbers. Read and interpret all of them carefully.
12. Return ONLY valid JSON. Do not include markdown, explanations, comments, or any additional text.
13. Do not translate Thai item names into English

JSON format:
{
  "shopName": string | null,
  "branch": string | null,
  "receiptNumber": string | null,
  "date": string | null,
  "time": string | null,
  "customerName": string | null,
  "items": [
    {
      "name": string,
      "quantity": number | null,
      "unitPrice": number | null,
      "totalPrice": number | null
    }
  ],
  "subtotal": number | null,
  "vat": number | null,
  "totalAmount": number | null
}

OCR TEXT:
${ocrText}
`;


    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    return JSON.parse(response.text);
}

