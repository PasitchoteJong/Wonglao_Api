import multer from "multer";

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG images are allowed"), false);
  }
};

const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export {
  uploadImage as uploadQR,
  uploadImage as uploadReceipt,
  uploadImage as uploadSlip,
};

// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const backendDir = path.resolve(__dirname, "../../");

// // รวม Logic การจัดการ Storage ไว้ที่นี่ที่เดียว
// // const dynamicStorage = multer.diskStorage({
// const dynamicStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let subDir = "others";
    
//     // ตรวจสอบจาก URL ของ Request ที่วิ่งเข้ามาเพื่อแยกโฟลเดอร์
//     if (req.originalUrl.includes("/qr")) subDir = "qr";
//     else if (req.originalUrl.includes("/receipt")) subDir = "receipts";
//     else if (req.originalUrl.includes("/slip")) subDir = "slips";

//     const targetDir = path.join(backendDir, "uploads", subDir);

//     // สร้างโฟลเดอร์อัตโนมัติเมื่อมีการอัปโหลดจริง
//     if (!fs.existsSync(targetDir)) {
//       fs.mkdirSync(targetDir, { recursive: true });
//     }
//     cb(null, targetDir);
//   },

//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    
//     // เลียนแบบการตั้งชื่อไฟล์ตาม Logic เดิมของคุณ
//     if (req.originalUrl.includes("/qr")) {
//       cb(null, `qr-${Date.now()}${ext}`);
//     } else {
//       cb(null, `${uniqueSuffix}${ext}`);
//     }
//   },
// });

// // ตัวกรองไฟล์รูปภาพ (ใช้ร่วมกัน)
// const imageFileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JPG and PNG images are allowed"), false);
//   }
// };

// // 1. สร้าง Instance ของ Multer เพียงตัวเดียวในระบบ
// const uploadImage = multer({
//   storage: dynamicStorage,
//   fileFilter: imageFileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

// // 2. ส่งออกชื่อเดิม (แต่เบื้องหลังชี้ไปที่ uploadImage ตัวเดียวกัน)
// // วิธีนี้ทำให้ไฟล์อื่นในโปรเจกต์ไม่ต้องแก้ไขโค้ดเลยแม้แต่บรรทัดเดียว
// export {
//   uploadImage as uploadQR,
//   uploadImage as uploadReceipt,
//   uploadImage as uploadSlip
// };

//////////////////////////////////////////////////////////////////////////
// // หา directory ของไฟล์ปัจจุบัน
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Backend/
// const backendDir = path.resolve(__dirname, "../../");

// // =========================
// // QR Upload
// // =========================

// const qrUploadDir = path.join(backendDir, "uploads", "qr");

// // สร้างโฟลเดอร์ QR ถ้ายังไม่มี
// if (!fs.existsSync(qrUploadDir)) {
//   fs.mkdirSync(qrUploadDir, { recursive: true });
// }

// const qrStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, qrUploadDir);
//   },

//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const filename = `qr-${Date.now()}${ext}`;

//     cb(null, filename);
//   },
// });

// const imageFileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "image/jpeg",
//     "image/png",
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error("Only JPG and PNG images are allowed"),
//       false
//     );
//   }
// };

// const uploadQR = multer({
//   storage: qrStorage,
//   fileFilter: imageFileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });


// // =========================
// // Receipt Upload
// // =========================

// const receiptUploadDir = path.join(
//   backendDir,
//   "uploads",
//   "receipts"
// );

// // สร้างโฟลเดอร์ Receipt ถ้ายังไม่มี
// if (!fs.existsSync(receiptUploadDir)) {
//   fs.mkdirSync(receiptUploadDir, { recursive: true });
// }

// const receiptStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, receiptUploadDir);
//   },

//   filename: (req, file, cb) => {
//     const uniqueSuffix =
//       Date.now() + "-" + Math.round(Math.random() * 1e9);

//     cb(
//       null,
//       uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const uploadReceipt = multer({
//   storage: receiptStorage,
//   fileFilter: imageFileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// // =========================
// // Slip Upload
// // =========================

// const slipUploadDir = path.join(
//   backendDir,
//   "uploads",
//   "slips"
// );

// if (!fs.existsSync(slipUploadDir)) {
//   fs.mkdirSync(slipUploadDir, { recursive: true });
// }

// const slipStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, slipUploadDir);
//   },

//   filename: (req, file, cb) => {
//     const extension = path.extname(file.originalname);

//     const filename =
//       `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

//     cb(null, filename);
//   },
// });

// const uploadSlip = multer({
//   storage: slipStorage,
//   fileFilter: imageFileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });





// // =========================
// // Export
// // =========================

// export {
//   uploadQR,
//   uploadReceipt,
//   uploadSlip
// };