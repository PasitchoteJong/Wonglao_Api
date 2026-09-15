import { Router } from "express";

import authMiddleware from "../middlewares/authenticate.middleware.js"
import {
    confirmRoulettePaymentController,
    getRoulette,
    spinRoulette,
    updateRouletteEligibility,
    updateRouletteMember
} from "../controllers/roulette.controller.js";
import { billOwnerMiddleware } from "../middlewares/billOwner.middleware.js";


const rouletteRoute = Router();

rouletteRoute.patch("/:billId/members/:billMemberId/eligibility", authMiddleware, updateRouletteEligibility);
rouletteRoute.patch("/:billId/confirm-payment", authMiddleware, confirmRoulettePaymentController)
rouletteRoute.get("/:billId", authMiddleware, getRoulette);
rouletteRoute.post("/:billId/spin", authMiddleware, billOwnerMiddleware, spinRoulette);
rouletteRoute.patch("/:billId/members/:memberId", authMiddleware, billOwnerMiddleware, updateRouletteMember);

export default rouletteRoute;