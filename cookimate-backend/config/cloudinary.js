import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary"; // Add this
import multer from "multer"; // Add this
import dotenv from "dotenv";

dotenv.config();

// 1. Basic Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Setup the Storage Engine (The "Pipe")
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cookimate_posts", // Images will go in this folder
    allowed_formats: ["jpg", "png", "jpeg"],
    // Optional: This optimizes the image on Cloudinary's side
    transformation: [{ width: 1000, crop: "limit", quality: "auto" }],
  },
});

// 3. Initialize Multer with a 10MB limit
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB safety cap
});

export { cloudinary, upload }; // Export 'upload' too