import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import pkg from "multer-storage-cloudinary";

// Handle the "not a constructor" error by finding the correct export path
const CloudinaryStorage = pkg.CloudinaryStorage || pkg;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posts",
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) => {
      const fileName = file.originalname.split(".")[0];
      return `${fileName}-${Date.now()}`;
    },
  },
});

export const upload = multer({ storage });
