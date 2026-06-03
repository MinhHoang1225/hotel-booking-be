import multer from "multer";
import { AppError } from "../common/AppError";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new AppError(400, "Only image files are allowed"));
    cb(null, true);
  }
});

export { upload };

