import supabase from "../../lib/supabase.js";
import axios from "axios";

const uploadFile = async (fileBuffer, originalName, mimeType, folder) => {
  const extension = originalName.split(".").pop();

  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const uploadReceipt = async (file) => {
  return uploadFile(
    file.buffer,
    file.originalname,
    file.mimetype,
    "receipts"
  );
};

export const uploadQR = async (file) => {
  return uploadFile(
    file.buffer,
    file.originalname,
    file.mimetype,
    "qr"
  );
};

export const uploadPaymentSlip = async (file) => {
    return uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        "slip"
    );
};

export const uploadProfileImage = async (imageUrl) => {
    const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"] || "image/jpeg";

    return uploadFile(
        Buffer.from(response.data),
        "profile.jpg",
        contentType,
        "profiles"
    );
};