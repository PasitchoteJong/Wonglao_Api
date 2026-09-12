import { Router } from "express";
import {
    createBill,
    getBillById,
    verifyBill,
    getFoodSelection,
    updateFoodSelection,
    updateBillItems,
    getBillSummary
} from "../controllers/bill.controller.js";
import { uploadReceipt } from "../middlewares/upload.middleware.js";
import authMiddleware from "../middlewares/authenticate.middleware.js"

const billRoute = Router();

billRoute.post('/', authMiddleware, uploadReceipt.single("receiptFile"), createBill);
billRoute.get('/:id', authMiddleware, getBillById);
billRoute.put('/:id/verify', authMiddleware, verifyBill);

// Food-selection & Bill splitting
billRoute.get('/:id/selection', authMiddleware, getFoodSelection);
billRoute.put('/:id/selection', authMiddleware, updateFoodSelection);

// Edit bill items (Correcting OCR errors)
billRoute.put('/:id/items', authMiddleware, updateBillItems);

// Bill splitting summary calculation
billRoute.get('/:id/summary', authMiddleware, getBillSummary);

export default billRoute;