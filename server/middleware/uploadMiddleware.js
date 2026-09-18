import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, "../uploads");

if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, uploadsDirectory);
    },
    filename: (request, file, callback) => {
        const extension = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

        callback(null, uniqueName);
    },
});

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const fileFilter = (request, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(
            new Error("Only JPG, PNG, and WebP images are allowed")
        );
    }
    callback(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export default upload;