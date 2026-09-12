import express from 'express';
import cors from "cors";
import createHttpError from 'http-errors';
import path from 'path';

import authRoute from './src/routes/auth.routes.js';
import errorMiddleware from './src/middlewares/error.middleware.js';
import billRoute from './src/routes/bill.routes.js';
import ocrRoute from "./src/routes/ocr.routes.js";
import joinBillRoute from './src/routes/join-bill.routes.js';

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoute);
app.use('/api/bills', billRoute);
app.use('/api/ocr', ocrRoute);
app.use('/api/่jbill', joinBillRoute)

app.get('/', (req, res) => {
  res.json({
    message: 'WongLao API is running'
  });
});

app.use((req, res, next) => {
  return next(createHttpError.NotFound());
});

app.use(errorMiddleware);

export default app;