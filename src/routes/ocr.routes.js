import { Router } from "express";
import { saveOCRResult } from "../controllers/ocr.controller.js";
import authMiddleware from "../middlewares/authenticate.middleware.js"

const ocrRoute = Router();

// ocrRoute.post("/receipt", ocrReceipt);
ocrRoute.post("/bill/:billId", authMiddleware, saveOCRResult)

export default ocrRoute;