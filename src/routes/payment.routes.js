import { Router } from "express";

import authMiddleware from "../middlewares/authenticate.middleware.js"
import { uploadSlip } from "../middlewares/upload.middleware.js"
import {
    getMyPaymentInfo,
    getPaymentMemberDetailInfo,
    getPaymentSummary,
    getPaymentSummaryInfo,
    getPendingPaymentSlips,
    uploadPaymentSlip,
    verifyPaymentSlip
} from "../controllers/payment.controller.js";

const paymentRoute = Router();
paymentRoute.get("/:billId/me", authMiddleware, getMyPaymentInfo);
paymentRoute.post("/:billId/slip", authMiddleware, uploadSlip.single("proofImage"), uploadPaymentSlip);
paymentRoute.patch("/slip/:paymentSlipId/verify", authMiddleware, verifyPaymentSlip)
paymentRoute.get("/:billId/summary", authMiddleware, getPaymentSummaryInfo)
paymentRoute.get("/:billId/member/:billMemberId", authMiddleware, getPaymentMemberDetailInfo)
paymentRoute.get("/:billId/pending", authMiddleware, getPendingPaymentSlips)
paymentRoute.get("/summary", authMiddleware, getPaymentSummary)


export default paymentRoute;