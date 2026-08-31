import express from 'express';
import createHttpError from 'http-errors'
import authRoute from './src/routes/auth.routes.js';
import errorMiddleware from './src/middlewares/error.middleware.js';


const app = express()
app.use(express.json())

app.use('/api/auth', authRoute)


app.use((req, res, next) => {
  return next(createHttpError.NotFound())
})

 
app.use(errorMiddleware)
export default app;