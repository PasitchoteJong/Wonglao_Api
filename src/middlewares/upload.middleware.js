import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";


// หา directory ของไฟล์ปัจจุบัน
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend/
const backendDir = path.resolve(__dirname, "../../");

// Backend/uploads/qr
const uploadDir = path.join(backendDir, "uploads", "qr");


// สร้างโฟลเดอร์ uploads/qr ถ้ายังไม่มี
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const filename = `qr-${Date.now()}${ext}`;

    cb(null, filename);
  },
});

// ตรวจสอบประเภทไฟล์
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, and PNG images are allowed"),
      false
    );
  }
};

const uploadQR = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export default uploadQR;