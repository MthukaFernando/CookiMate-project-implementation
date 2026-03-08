import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import pkg from 'multer-storage-cloudinary';

const CloudinaryStorage = pkg.CloudinaryStorage || pkg;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Storage
const storage = new CloudinaryStorage({
  // The library will look for .v2 or .uploader inside this.
  cloudinary: cloudinary, 
  params: {
    folder: 'social_posts',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
  },
});

export const upload = multer({ storage });