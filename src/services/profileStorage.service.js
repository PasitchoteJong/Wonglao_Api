import  supabase  from "../../lib/supabase.js";


const BUCKET_NAME = "WongLao";

const getExtension = (file) => {
    if (file.mimetype === "image/png") {
        return "png";
    }

    return "jpg";
};

const uploadImage = async ({ file, userId, folder, prefix, }) => {
    if (!file) throw new Error("Image file is required");

    const extension = getExtension(file);
    const fileName = `${prefix}-${Date.now()}.${extension}`;
    const filePath = `profile/${userId}/${folder}/${fileName}`;

    const { data, error, } = await supabase.storage.from(BUCKET_NAME).upload(
        filePath,
        file.buffer,
        {
            contentType: file.mimetype,
            upsert: false,
        }
    );


    if (error) {
        console.error("Supabase upload error:", error);

        throw new Error("Failed to upload image");
    }

    const { data: publicUrlData, } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);


    if (
        !publicUrlData
            ?.publicUrl
    ) {
        throw new Error(
            "Failed to get image URL"
        );
    }


    return publicUrlData.publicUrl;
};


// ========================================
// PROFILE IMAGE
// ========================================

export const uploadProfileImage =
    async (file, userId) => {
        return uploadImage({
            file,
            userId,
            folder: "profile-image",
            prefix: "profile",
        });
    };


export const uploadQRPaymentImage = async (file, userId) => {
    return uploadImage({
        file,
        userId,
        folder: "qr-payment",
        prefix: "qr",
    });
};