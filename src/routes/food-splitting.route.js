import { Router } from "express";
import authMiddleware from "../middlewares/authenticate.middleware.js"
import {
    calculateProportionalSplit,
    getFoodSelection,
    getMyFoodSplit,
    getMyFoodSplitForMe,
    updateFoodSelection
} from "../controllers/food-splitting.controller.js";


const foodSplittingRoute = Router();

foodSplittingRoute.get("/:billId", authMiddleware, getFoodSelection);
foodSplittingRoute.patch("/:billId", authMiddleware, updateFoodSelection);
foodSplittingRoute.post("/:billId/calculate", authMiddleware, calculateProportionalSplit)
foodSplittingRoute.get("/:billId/me", authMiddleware, getMyFoodSplitForMe)
foodSplittingRoute.get("/:billId/eatMe", authMiddleware, getMyFoodSplit)


export default foodSplittingRoute;