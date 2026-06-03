import { cloudinary, hasCloudinary } from "../config/cloudinary";
import { AppError } from "./AppError";

function uploadBuffer(file, folder) {
  if (!hasCloudinary) throw new AppError(501, "Cloudinary is not configured");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}

async function uploadImages(files, folder) {
  if (!files || files.length === 0) throw new AppError(400, "No images uploaded");
  return Promise.all(files.map((file) => uploadBuffer(file, folder)));
}

export { uploadImages };

