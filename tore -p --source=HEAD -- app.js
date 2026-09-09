[1mdiff --git a/app.js b/app.js[m
[1mindex 358a843..6f05c4f 100644[m
[1m--- a/app.js[m
[1m+++ b/app.js[m
[36m@@ -1,37 +1,36 @@[m
 import express from 'express';[m
 import cors from "cors";[m
[31m-import createHttpError from 'http-errors'[m
[31m-[m
[32m+[m[32mimport createHttpError from 'http-errors';[m
[32m+[m[32mimport path from 'path';[m
 [m
 import authRoute from './src/routes/auth.routes.js';[m
 import errorMiddleware from './src/middlewares/error.middleware.js';[m
 import billRoute from './src/routes/bill.routes.js';[m
 import ocrRoute from "./src/routes/ocr.routes.js";[m
 [m
[31m-const app = express()[m
[32m+[m[32mconst app = express();[m
 [m
 app.use(cors({[m
   origin: "http://localhost:5173"[m
 }));[m
 [m
[32m+[m[32mapp.use(express.json());[m
 [m
[32m+[m[32mapp.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));[m
 [m
[31m-app.use(express.json())[m
[31m-[m
[31m-app.use('/api/auth', authRoute)[m
[31m-app.use('/api/bill', billRoute)[m
[31m-app.use('/api/ocr', ocrRoute)[m
[32m+[m[32mapp.use('/api/auth', authRoute);[m
[32m+[m[32mapp.use('/api/bills', billRoute);[m
[32m+[m[32mapp.use('/api/ocr', ocrRoute);[m
 [m
[31m-app.get('/',(req,res)=>{[m
[32m+[m[32mapp.get('/', (req, res) => {[m
   res.json({[m
[31m-    message:'WongLao API is running'[m
[31m-  })[m
[31m-})[m
[32m+[m[32m    message: 'WongLao API is running'[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
 [m
 app.use((req, res, next) => {[m
[31m-  return next(createHttpError.NotFound())[m
[31m-})[m
[31m-[m
[32m+[m[32m  return next(createHttpError.NotFound());[m
[32m+[m[32m});[m
 [m
 app.use(errorMiddleware);[m
 [m
[1mdiff --git a/lib/prisma.js b/lib/prisma.js[m
[1mindex 5f8e562..e33b3b1 100644[m
[1m--- a/lib/prisma.js[m
[1m+++ b/lib/prisma.js[m
[36m@@ -1,9 +1,22 @@[m
 import "dotenv/config";[m
 import { PrismaMariaDb } from "@prisma/adapter-mariadb";[m
 import { PrismaClient } from "../generated/prisma/client.js";[m
[32m+[m[32m// import pkg from 'mariadb';[m
[32m+[m[32m// const { createPool } = pkg;[m
 [m
 [m
 const adapter = new PrismaMariaDb(process.env.DATABASE_URL);[m
[32m+[m[32m// // สร้าง Connection Pool ของ mariadb โดยระบุพารามิเตอร์ให้ชัดเจน[m
[32m+[m[32m// const pool = createPool({[m
[32m+[m[32m//   host: "127.0.0.1",[m
[32m+[m[32m//   port: 3306,[m
[32m+[m[32m//   user: "root",[m
[32m+[m[32m//   password: "password",[m[41m [m
[32m+[m[32m//   database: "mock_up_db",[m
[32m+[m[32m//   connectionLimit: 5,[m
[32m+[m[32m// });[m
[32m+[m
[32m+[m[32m// const adapter = new PrismaMariaDb(pool);[m
 const prisma = new PrismaClient({ adapter });[m
 [m
 export { prisma };[m
\ No newline at end of file[m
[1mdiff --git a/server.js b/server.js[m
[1mindex d371d91..beafd72 100644[m
[1m--- a/server.js[m
[1m+++ b/server.js[m
[36m@@ -1,4 +1,6 @@[m
 import dotenv from "dotenv";[m
[32m+[m[32mdotenv.config();[m
[32m+[m
 import app from "./app.js";[m
 import http from "http";[m
 [m
[1mdiff --git a/src/controllers/bill.controller.js b/src/controllers/bill.controller.js[m
[1mindex b461843..9fa2ed4 100644[m
[1m--- a/src/controllers/bill.controller.js[m
[1m+++ b/src/controllers/bill.controller.js[m
[36m@@ -1,36 +1,109 @@[m
 import createHttpError from "http-errors";[m
[31m-import { createBillInDB } from "../services/bill.service.js";[m
[32m+[m[32mimport { createBillInDB, saveOCRResultToBill } from "../services/bill.service.js";[m
[32m+[m[32mimport { extractTextFromReceipt } from "../services/ocr.service.js";[m
[32m+[m[32mimport { structureReceiptText } from "../services/gemini.service.js";[m
[32m+[m[32mimport { prisma } from "../../lib/prisma.js";[m
[32m+[m[32mimport path from "path";[m
 [m
[31m-export const createBill = async (req, resizeBy, next) => {[m
[31m-    try{[m
[31m-        const { billName } = req.body[m
[32m+[m[32m// สร้างบิล พร้อมรัน OCR อัตโนมัติ[m
[32m+[m[32mexport const createBill = async (req, res, next) => {[m
[32m+[m[32m    try {[m
[32m+[m[32m        const { billName } = req.body;[m
         const receiptImage = req.file[m
             ? `/uploads/receipts/${req.file.filename}`[m
[31m-            : null[m
[31m-[m
[31m-        console.log("BODY:", req.body)[m
[31m-        console.log("FILE:", req.file)[m
[32m+[m[32m            : null;[m
 [m
         if (!billName) {[m
[31m-            throw createHttpError(400, "Bill name is required")[m
[32m+[m[32m            throw createHttpError(400, "Bill name is required");[m
         }[m
 [m
         if (!receiptImage) {[m
[31m-            throw createHttpError(400, "Receipt image is required")[m
[32m+[m[32m            throw createHttpError(400, "Receipt image is required");[m
         }[m
 [m
[32m+[m[32m        // 1. สร้างบิลตั้งต้นใน DB ก่อน[m
         const newBill = await createBillInDB({[m
             memberId: req.user?.userId || req.user?.id,[m
             shopName: billName,[m
             receiptImage: receiptImage,[m
[31m-        })[m
[32m+[m[32m        });[m
[32m+[m
[32m+[m[32m        // 2. ถ้ารูปมีอยู่จริง ให้รัน OCR และ Gemini จัดโครงสร้างต่อทันทีแบบเบื้องหลัง[m
[32m+[m[32m        try {[m
[32m+[m[32m            const absolutePath = path.join(process.cwd(), receiptImage);[m
[32m+[m[32m            const ocrText = await extractTextFromReceipt(absolutePath);[m
[32m+[m[41m            [m
[32m+[m[32m            if (ocrText) {[m
[32m+[m[32m                const structureData = await structureReceiptText(ocrText);[m
[32m+[m[41m                [m
[32m+[m[32m                // 3. บันทึกผล OCR (ชื่อร้าน, ยอดรวม, รายการสินค้า) ลง Bill เดิมทันที[m
[32m+[m[32m                if (structureData) {[m
[32m+[m[32m                    await saveOCRResultToBill(newBill.Id, {[m
[32m+[m[32m                        shopName: structureData.shopName || billName,[m
[32m+[m[32m                        totalAmount: structureData.totalAmount || 0,[m
[32m+[m[32m                        items: structureData.items || [][m
[32m+[m[32m                    });[m
[32m+[m[32m                }[m
[32m+[m[32m            }[m
[32m+[m[32m        } catch (ocrError) {[m
[32m+[m[32m            console.error("Auto OCR Processing Warning:", ocrError);[m
[32m+[m[32m            // ให้ข้ามไปได้แม้ OCR จะรันพลาด เพื่อไม่ให้บล็อกการสร้างบิลของผู้ใช้[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        // ดึงข้อมูลบิลล่าสุดที่อัปเดตข้อมูล OCR แล้วส่งกลับไป[m
[32m+[m[32m        const finalBill = await prisma.bill.findUnique({[m
[32m+[m[32m            where: { Id: newBill.Id },[m
[32m+[m[32m            include: { BillItem: true }[m
[32m+[m[32m        });[m
 [m
         return res.status(201).json({[m
[31m-            message: "Bill created",[m
[31m-            bill: newBill[m
[31m-        })[m
[32m+[m[32m            message: "Bill created and processed with OCR",[m
[32m+[m[32m            bill: finalBill[m
[32m+[m[32m        });[m
[32m+[m
[32m+[m[32m    } catch (error) {[m
[32m+[m[32m        console.error("Create Bill Error:", error);[m
[32m+[m[32m        next(error.status ? error : createHttpError(500, "Failed to create bill"));[m
[32m+[m[32m    }[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mexport const getBillById = async (req, res, next) => {[m
[32m+[m[32m    try {[m
[32m+[m[32m        const { id } = req.params;[m
[32m+[m
[32m+[m[32m        const bill = await prisma.bill.findUnique({[m
[32m+[m[32m            where: { Id: id },[m
[32m+[m[32m            include: { BillItem: true }[m
[32m+[m[32m        });[m
[32m+[m
[32m+[m[32m        if (!bill) {[m
[32m+[m[32m            throw createHttpError(404, "Bill not found");[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        return res.status(200).json({ bill });[m
[32m+[m[32m    } catch (error) {[m
[32m+[m[32m        console.error("Get Bill Error:", error);[m
[32m+[m[32m        next(error.status ? error : createHttpError(500, "Failed to get bill"));[m
[32m+[m[32m    }[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32mexport const verifyBill = async (req, res, next) => {[m
[32m+[m[32m    try {[m
[32m+[m[32m        const { id } = req.params;[m
[32m+[m[32m        const { shopName, totalAmount } = req.body;[m
[32m+[m
[32m+[m[32m        const updatedBill = await saveOCRResultToBill(id, {[m
[32m+[m[32m            shopName,[m
[32m+[m[32m            totalAmount: totalAmount ? parseFloat(totalAmount) : 0,[m
[32m+[m[32m            items: [][m
[32m+[m[32m        });[m
[32m+[m
[32m+[m[32m        return res.status(200).json({[m
[32m+[m[32m            message: "Bill verified successfully",[m
[32m+[m[32m            bill: updatedBill[m
[32m+[m[32m        });[m
     } catch (error) {[m
[31m-        console.error("Create Bill Error:", error)[m
[31m-        next(error.status ? error : createHttpError(500, "Failed to create bill"))[m
[32m+[m[32m        console.error("Verify Bill Error:", error);[m
[32m+[m[32m        next(error.status ? error : createHttpError(500, "Failed to verify bill"));[m
     }[m
[31m-}[m
\ No newline at end of file[m
[32m+[m[32m};[m
\ No newline at end of file[m
[1mdiff --git a/src/routes/bill.routes.js b/src/routes/bill.routes.js[m
[1mindex 9d08eba..b4aa557 100644[m
[1m--- a/src/routes/bill.routes.js[m
[1m+++ b/src/routes/bill.routes.js[m
[36m@@ -1,10 +1,11 @@[m
 import { Router } from "express";[m
[31m-import { createBill } from "../controllers/bill.controller.js";[m
[31m-import {uploadReceipt} from "../middlewares/upload.middleware.js";[m
[32m+[m[32mimport { createBill, getBillById, verifyBill } from "../controllers/bill.controller.js";[m
[32m+[m[32mimport { uploadReceipt } from "../middlewares/upload.middleware.js";[m
 [m
 const billRoute = Router();[m
 [m
[31m-// .get("/receipt/upload",);[m
[31m-billRoute.post('/bills', uploadReceipt.single("receiptFile"), createBill)[m
[32m+[m[32mbillRoute.post('/', uploadReceipt.single("receiptFile"), createBill);[m
[32m+[m[32mbillRoute.get('/:id', getBillById);[m[41m [m
[32m+[m[32mbillRoute.put('/:id/verify', verifyBill);[m[41m [m
 [m
 export default billRoute;[m
\ No newline at end of file[m
