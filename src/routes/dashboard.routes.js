import {Router} from "express";
import authMiddleware from "../middlewares/authenticate.middleware.js"
import { getWeeklyExpenses } from "../controllers/dashboard.controller.js";



const dashboardRoute = Router();

dashboardRoute.get('/weekly-expenses', authMiddleware, getWeeklyExpenses);


export default dashboardRoute;