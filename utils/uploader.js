import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a local multer file object to Cloudinary or falls back to local/base64 URL
 * @param {Object} file - Multer file object
 * @param {String} userId - User identifier for folder segregation
 * @param {String} fileType - 'image' | 'pdf' | 'document'
 * @returns {Promise<Object>}
 */
export const processUploadedFile = async (file, userId = 'general', fileType = 'document') => {
  if (!file) return null;

  if (isCloudinaryConfigured && file.path && fs.existsSync(file.path)) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `rbsk/${userId}`,
        resource_type: 'auto'
      });

      // Safely delete temp file after Cloudinary upload
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        // Ignore unlink error
      }

      return {
        url: result.secure_url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        originalFilename: file.originalname,
        bytes: file.size || result.bytes,
        fileType: file.mimetype && file.mimetype.includes('pdf') ? 'pdf' : 'image'
      };
    } catch (cloudError) {
      console.warn('⚠️ Cloudinary upload warning, falling back:', cloudError.message);
    }
  }

  // Fallback: If local file exists, serve from /uploads
  if (file.filename) {
    return {
      url: `/uploads/${file.filename}`,
      secureUrl: `/uploads/${file.filename}`,
      publicId: file.filename,
      originalFilename: file.originalname,
      bytes: file.size,
      fileType: file.mimetype && file.mimetype.includes('pdf') ? 'pdf' : 'image'
    };
  }

  return null;
};
