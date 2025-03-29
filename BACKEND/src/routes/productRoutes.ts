import express from "express";
import ProductRepository from "../Repository/ProductRepository.js";
import AuthRepository from "../Repository/AuthRepository.js";
import { uploadProductImages, uploadProductNewImages } from "../Repository/multer.js";
import { log } from "console";

const router = express.Router();

router.get('/',ProductRepository.getAllProducts);
router.get('/search',ProductRepository.searchProducts);
router.get('/newProducts',ProductRepository.getNewProducts);
router.get('/bestSellers',ProductRepository.getBestSellers);
router.get('/:productId',ProductRepository.getProductById);
router.post('/',uploadProductImages,ProductRepository.createProduct);
router.patch('/:productId',uploadProductNewImages,ProductRepository.updateProductById);
router.patch('/:productId/img',uploadProductImages,ProductRepository.updateProductImagesById)
router.delete('/:productId',ProductRepository.deleteProductById);

export default router;