import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'tzp6qydi',
  api_key: process.env.CLOUDINARY_API_KEY || '995267275594641',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'VTtN8I3knzUmsfzm9Y0OkoQXEiU'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
    transformation: [{ width: 1000, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const uploadToCloudinary = (fileBuffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [{ width: 1000, crop: 'limit', quality: 'auto' }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const uploadBase64ToCloudinary = async (base64String, folder = 'products') => {
  if (!base64String || typeof base64String !== 'string') return base64String;
  if (!base64String.startsWith('data:image')) return base64String; // Already a URL

  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: 'image',
      transformation: [{ width: 1000, crop: 'limit', quality: 'auto' }]
    });
    return result.secure_url;
  } catch (err) {
    console.error('[CLOUDINARY BASE64 UPLOAD ERROR]', err);
    return base64String; // Fallback to raw string if error occurs
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('[CLOUDINARY DELETE ERROR]', err);
  }
};

export { cloudinary, upload };
