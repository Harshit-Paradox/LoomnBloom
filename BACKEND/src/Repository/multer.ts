import multer from "multer";
import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import { log } from "console";
//disable eslin
// const multerS3 = require('multer-s3');
dotenv.config({ path: "config.env" });

// Multer storage configuration
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//       if (req.url.includes('/profile/img')) {
//         cb(null, './uploads/user');
//     } else if (req.url.includes('/')) {
//         cb(null, './uploads/product');
//     } else {
//       cb(new Error('Not an image! Please upload only images.'), "false");
//     }
//     },
//     filename: (req, file, cb) => {
//         // The filenames will be kept as original name with extension added by multer
//         const origName = `${file.originalname}`;
//         const extName = `.${file.mimetype.split('/')[1]}`;

//         // Remove the extension from the original filename
//         const fileNameWithoutExt = origName.substring(0, origName.lastIndexOf('.'));

//         cb(null, fileNameWithoutExt + '-' + Date.now() + extName);
//     }
// });
const s3Client = new S3Client({
	credentials: {
		accessKeyId: process.env.accessKeyId || "your_access_key_id",
		secretAccessKey: process.env.secretAccessKey || "your_secret_access_key",
	},
	region: "ap-south-1",
});
const multerStorage = multerS3({
	s3: s3Client,
	contentType: multerS3.AUTO_CONTENT_TYPE,
	bucket: "haatbazaar-data",
	key: function (req: any, file: any, cb: any) {
		const origName = `${file.originalname}`;
		const extName = `.${file.mimetype.split("/")[1]}`;

		// Remove the extension from the original filename
		const fileNameWithoutExt = origName.substring(0, origName.lastIndexOf("."));

		// Check if it's for profile photo or product image and assign the appropriate path
		let folderPath = "";
		if (req.url.includes("/profile/img") || file.fieldname === "profilePhoto") {
			folderPath = "uploads/profile_images/";
		} else if (
			req.url.includes("/product") ||
			file.fieldname === "images" ||
			file.fieldname === "newImages"
		) {
			folderPath = "uploads/product_images/";
		} else {
			return cb(new Error("Invalid upload type"), false);
		}
		// Generate unique file name with timestamp
		const finalFileName = `${folderPath}u_${fileNameWithoutExt}-${Date.now()}${extName}`;

		cb(null, finalFileName);
	},
});

const multerFilter = (req: any, file: any, cb: any) => {
	if (file.mimetype.startsWith("image")) {
		cb(null, true);
	} else {
		cb(new Error("Not an image! Please upload only images."), false);
	}
};

// Multer configuration for product images
export const uploadProductImages = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
	limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
}).fields([{ name: "images" }]);
export const uploadProductNewImages = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
	limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
}).fields([{ name: "newImages" }]);

// Multer configuration for user profile photos
export const uploadUserProfilePhoto = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
	limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 2MB for profile photos
}).single("profilePhoto");
