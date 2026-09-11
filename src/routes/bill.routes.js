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

const billRoute = Router();

billRoute.post('/', uploadReceipt.single("receiptFile"), createBill);
billRoute.get('/:id', getBillById); 
billRoute.put('/:id/verify', verifyBill); 

// Food-selection & Bill splitting
billRoute.get('/:id/selection', getFoodSelection);
billRoute.put('/:id/selection', updateFoodSelection);

// Edit bill items (Correcting OCR errors)
billRoute.put('/:id/items', updateBillItems);

// Bill splitting summary calculation
billRoute.get('/:id/summary', getBillSummary);

export default billRoute;