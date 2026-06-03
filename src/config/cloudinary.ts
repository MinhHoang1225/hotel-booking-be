import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (imageStr: string) => {
  if (!imageStr.startsWith("data:image")) return imageStr; // Nếu đã là URL thì bỏ qua
  const uploadResponse = await cloudinary.uploader.upload(imageStr, {
    folder: "hotel_booking",
  });
  return uploadResponse.secure_url;
};

export const uploadMultipleImages = async (images: string[]) => {
  if (!images || images.length === 0) return [];
  return Promise.all(images.map((img) => uploadImage(img)));
};
