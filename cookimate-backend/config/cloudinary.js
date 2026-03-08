import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import pkg from 'multer-storage-cloudinary';

// This is the fail-safe: it checks if CloudinaryStorage is a property 
// or if the package itself is the constructor.
const CloudinaryStorage = pkg.CloudinaryStorage || pkg;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Storage
// cloudinary.js
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social_posts',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // Remove the public_id line for a moment to let Cloudinary name it automatically
  },
});
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});