import { Router } from "express";

import authMiddleware from "../middlewares/authenticate.middleware.js"
import { billOwnerMiddleware } from "../middlewares/billOwner.middleware.js";
import {
    confirmRoulettePaymentController,
    getRoulette,
    spinRoulette,
    updateRouletteEligibility
} from "../controllers/roulette.controller.js";


const rouletteRoute = Router();

rouletteRoute.get("/:billId", authMiddleware, getRoulette);
rouletteRoute.patch("/:billId/members/:billMemberId/eligibility", authMiddleware, billOwnerMiddleware, updateRouletteEligibility);
rouletteRoute.post("/:billId/spin", authMiddleware, billOwnerMiddleware, spinRoulette);
rouletteRoute.patch("/:billId/confirm-payment", authMiddleware, billOwnerMiddleware, confirmRoulettePaymentController);



export default rouletteRoute;