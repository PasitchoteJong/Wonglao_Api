import { Router } from "express";

import authMiddleware from "../middlewares/authenticate.middleware.js"
import { uploadSlip } from "../middlewares/upload.middleware.js"
import {
    getMyPaymentInfo,
    uploadPaymentSlip,
    verifyPaymentSlip
} from "../controllers/payment.controller";

const paymentRoute = Router();
paymentRoute.get("/:billId/me", authMiddleware, getMyPaymentInfo);
paymentRoute.post("/:billId/slip", authMiddleware, uploadSlip.single("proofImage"), uploadPaymentSlip);
paymentRoute.patch("/slip/:paymentSlipId/verify", authMiddleware, verifyPaymentSlip)

export default paymentRoute;