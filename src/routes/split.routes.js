import { Router } from "express";

import authMiddleware from "../middlewares/authenticate.middleware.js"
import { selectSplitMethod } from "../controllers/split.controller.js";



const splitRoute = Router();

splitRoute.patch("/:billId/split-method", authMiddleware, selectSplitMethod)

export default splitRoute;