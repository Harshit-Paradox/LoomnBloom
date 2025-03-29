var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import categoryModel from '../models/category.js';
import catchAsync from '../utels/CatchAsync.js';
import AppError from '../utels/AppError.js';
const createCategory = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, subCategory } = req.body;
    const newCategory = yield categoryModel.create({ name, subCategory });
    res.status(201).json({
        message: 'success',
        category: newCategory,
    });
}));
const getAllCategories = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield categoryModel.find();
    res.status(200).json({
        message: 'success',
        categories,
    });
}));
const deleteCategoryById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield categoryModel.findByIdAndDelete(id);
    if (!result) {
        return next(new AppError('category not found', 404));
    }
    res.status(204).json({
        message: "category deleted successfully",
    });
}));
const updateCategoryById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = req.params.categoryId;
    const result = yield categoryModel.findByIdAndUpdate(categoryId, req.body, {
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
}));
export default {
    createCategory,
    getAllCategories,
    deleteCategoryById,
    updateCategoryById
};
