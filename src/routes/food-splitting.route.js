import { Router } from "express";
import authMiddleware from "../middlewares/authenticate.middleware.js"
import {
    calculateProportionalSplit,
    getFoodSelection,
    getFoodSelectionStatus,
    getMyFoodSplit,
    getMyFoodSplitForMe,
    updateFoodSelection
} from "../controllers/food-splitting.controller.js";


const foodSplittingRoute = Router();

foodSplittingRoute.get("/:id/status", authMiddleware, getFoodSelectionStatus);
foodSplittingRoute.get("/:id", authMiddleware, getFoodSelection);
foodSplittingRoute.patch("/:billId", authMiddleware, updateFoodSelection);
foodSplittingRoute.post("/:billId/calculate", authMiddleware, calculateProportionalSplit)
foodSplittingRoute.get("/:billId/me", authMiddleware, getMyFoodSplitForMe)
foodSplittingRoute.get("/:billId/eatMe", authMiddleware, getMyFoodSplit)


export default foodSplittingRoute;