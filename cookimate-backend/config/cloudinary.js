import { v2 as cloudinary } from "cloudinary";
import pkg from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Locate the constructor
const CloudinaryStorage = pkg.CloudinaryStorage || pkg.default?.CloudinaryStorage || pkg;

// 3. Setup the Storage Engine
// NOTICE: We pass { v2: cloudinary } to satisfy the library's internal check
const storage = new CloudinaryStorage({
  cloudinary: { v2: cloudinary }, 
  params: {
    folder: "cookimate_posts", 
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 1000, crop: "limit", quality: "auto" }],
  },
});

// 4. Initialize Multer
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } 
});

export { cloudinary, upload };