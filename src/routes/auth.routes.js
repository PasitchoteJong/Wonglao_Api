import { Router } from 'express'
import {
    lineCallback
} from '../controllers/auth.controller.js'


const authRoute = Router()


// authRoute.post('/register',register)
authRoute.get('/line/callback', lineCallback)

export default authRoute