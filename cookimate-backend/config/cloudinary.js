import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import pkg from 'multer-storage-cloudinary';

const { CloudinaryStorage } = pkg;

// Configure Cloudinary with your .env credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Storage logic
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, 
  params: async (req, file) => {
    return {
      folder: 'social_posts',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      public_id: file.originalname.split('.')[0] + '-' + Date.now(),
    };
  },
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});