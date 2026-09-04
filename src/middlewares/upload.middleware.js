import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// หา directory ของไฟล์ปัจจุบัน
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend/
const backendDir = path.resolve(__dirname, "../../");

// =========================
// QR Upload
// =========================

const qrUploadDir = path.join(backendDir, "uploads", "qr");

// สร้างโฟลเดอร์ QR ถ้ายังไม่มี
if (!fs.existsSync(qrUploadDir)) {
  fs.mkdirSync(qrUploadDir, { recursive: true });
}

const qrStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, qrUploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `qr-${Date.now()}${ext}`;

    cb(null, filename);
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG and PNG images are allowed"),
      false
    );
  }
};

const uploadQR = multer({
  storage: qrStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// =========================
// Receipt Upload
// =========================

const receiptUploadDir = path.join(
  backendDir,
  "uploads",
  "receipts"
);

// สร้างโฟลเดอร์ Receipt ถ้ายังไม่มี
if (!fs.existsSync(receiptUploadDir)) {
  fs.mkdirSync(receiptUploadDir, { recursive: true });
}

const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptUploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const uploadReceipt = multer({
  storage: receiptStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// =========================
// Export
// =========================

export {
  uploadQR,
  uploadReceipt,
};