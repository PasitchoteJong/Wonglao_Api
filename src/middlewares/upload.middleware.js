import multer from "multer";

const storage = multer.diskStorage({
    destination:"uploads/qr",
    filename:(req,file,cb)=>{
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const uploadQR = multer({
    storage
});