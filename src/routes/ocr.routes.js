import { Router } from "express";
import { 
    ocrReceipt, 
    saveOCRResult } from "../controllers/ocr.controller.js";

const ocrRoute = Router();

ocrRoute.post("/receipt", ocrReceipt);
ocrRoute.post("/bill/:billId", saveOCRResult)

export default ocrRoute;