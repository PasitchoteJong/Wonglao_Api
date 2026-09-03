import { Router } from 'express'
import {
    lineCallback,
    registerLine
} from '../controllers/auth.controller.js'
import { uploadQR } from '../middlewares/upload.middleware.js';


const authRoute = Router()


// authRoute.post('/register',register)
authRoute.get('/line/callback', lineCallback);
authRoute.post('/line/register', uploadQR.single("qrPayment"), registerLine);

export default authRoute;