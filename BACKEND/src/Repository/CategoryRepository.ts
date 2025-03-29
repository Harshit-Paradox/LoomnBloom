import { Request, Response, NextFunction } from 'express';
import categoryModel from '../models/category.js';
import catchAsync from '../utels/CatchAsync.js';
import AppError from '../utels/AppError.js';

const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name , subCategory} = req.body;
  const newCategory = await categoryModel.create({ name ,subCategory});
  res.status(201).json({
    message: 'success',
    category: newCategory,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await categoryModel.find();
  res.status(200).json({
    message: 'success',
    categories,
  });
});

const deleteCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = await categoryModel.findByIdAndDelete(id);
  if (!result) {
    return next(new AppError('category not found', 404));
  }
  res.status(204).json({
    message: "category deleted successfully",
  });
});

const updateCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const categoryId = req.params.categoryId;
  const result = await categoryModel.findByIdAndUpdate(categoryId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!result) {
    return next(new AppError('category not found', 404));
  }
  res.status(200).json({
    message: "success",
    data: result,
  });
});

export default {
  createCategory,
  getAllCategories,
  deleteCategoryById,
  updateCategoryById
};
