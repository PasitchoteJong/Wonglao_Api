import { Router } from 'express'
import {
    lineCallback,
    loginTest,
    registerLine,
    registerTest
} from '../controllers/auth.controller.js'
import {uploadQR} from '../middlewares/upload.middleware.js';


const authRoute = Router()


// authRoute.post('/register',register)
authRoute.get('/line/callback', lineCallback);
authRoute.post('/line/register', uploadQR.single("qrPayment"), registerLine);
authRoute.post('/test-register', registerTest);
authRoute.post('/test-login',loginTest)
export default authRoute;