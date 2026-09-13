import { Router } from "express";

import authMiddleware from "../middlewares/authenticate.middleware.js"
import { calculateEqual, selectSplitMethod } from "../controllers/split.controller.js";



const splitRoute = Router();

splitRoute.patch("/:billId/split-method", authMiddleware, selectSplitMethod)
splitRoute.post("/:billId/equal", authMiddleware, calculateEqual)

export default splitRoute;