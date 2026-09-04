import { Router } from "express";
import { createBill } from "../controllers/bill.controller.js";
import uploadReceipt from "../middlewares/upload.middleware.js";

const billRoute = Router();

// .get("/receipt/upload",);
billRoute.post('/bills', uploadReceipt.single("receiptFile"), createBill)

export default billRoute;