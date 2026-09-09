import { Router } from "express";
import { createBill, getBillById, verifyBill } from "../controllers/bill.controller.js";
import { uploadReceipt } from "../middlewares/upload.middleware.js";

const billRoute = Router();

billRoute.post('/', uploadReceipt.single("receiptFile"), createBill);
billRoute.get('/:id', getBillById); 
billRoute.put('/:id/verify', verifyBill); 

export default billRoute;