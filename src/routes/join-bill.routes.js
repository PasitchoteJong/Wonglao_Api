import { Router } from "express";
import authMiddleware from "../middlewares/authenticate.middleware.js"
import { getJoinBill, joinBill } from "../controllers/join-bill.controller.js";


const joinBillRoute = Router();
joinBillRoute.get('/:billId/join',authMiddleware, getJoinBill)
joinBillRoute.post('/:billId/join', authMiddleware, joinBill)

export default joinBillRoute;