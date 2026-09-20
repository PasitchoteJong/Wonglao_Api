import { Router } from "express"
import authMiddleware from "../middlewares/authenticate.middleware.js"
import {
    getMyProfile,
    updateMyProfile
} from "../controllers/profile.controller.js";
import {
  uploadImage,
} from "../middlewares/upload.middleware.js";

const profileRouter = Router();

profileRouter.get('/me', authMiddleware, getMyProfile)
profileRouter.patch('/me', authMiddleware, uploadImage.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "qrPayment", maxCount: 1 },
]), updateMyProfile)


export default profileRouter;