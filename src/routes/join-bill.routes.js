import { Router } from "express";
import authMiddleware from "../middlewares/authenticate.middleware.js"
import { billOwnerMiddleware } from "../middlewares/billOwner.middleware.js";
import {
    getJoinBill,
    joinBill,
    leaveJoinBill,
    ownerRemoveMember,
} from "../controllers/join-bill.controller.js";


const joinBillRoute = Router();

joinBillRoute.get("/:billId/join", authMiddleware, getJoinBill);
joinBillRoute.post("/:billId/join", authMiddleware, joinBill);
joinBillRoute.delete("/:billId/members/me", authMiddleware, leaveJoinBill);
joinBillRoute.delete("/:billId/members/:memberId", authMiddleware, billOwnerMiddleware, ownerRemoveMember);

export default joinBillRoute;