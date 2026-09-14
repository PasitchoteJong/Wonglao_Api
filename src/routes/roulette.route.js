import { Router } from "express";

import authMiddleware from "../middlewares/authenticate.middleware.js"
import { confirmRoulettePaymentController, spinRoulette, updateRouletteEligibility } from "../controllers/roulette.controller.js";


const rouletteRoute = Router();

rouletteRoute.patch("/:billId/members/:billMemberId/eligibility", authMiddleware, updateRouletteEligibility);
rouletteRoute.post("/:billId/spin", authMiddleware, spinRoulette)
rouletteRoute.patch("/:billId/confirm-payment", authMiddleware, confirmRoulettePaymentController)

export default rouletteRoute;