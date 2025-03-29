import express from 'express';
import categoryController from '../Repository/CategoryRepository.js';
const router = express.Router();
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.patch('/:id', categoryController.updateCategoryById);
router.delete('/:id', categoryController.deleteCategoryById);
// Add other routes as needed
export default router;
