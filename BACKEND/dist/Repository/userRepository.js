var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ObjectId } from "mongodb";
import { userModel } from "../models/User.js";
import AppError from "../utels/AppError.js";
import APIFeatures from "../utels/apiFeatures.js";
import catchAsync from "../utels/CatchAsync.js";
import bcrypt from 'bcryptjs';
const getUserById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const result = yield userModel.findById(userId);
    if (!result) {
        return next(new AppError('User not found', 404));
    }
    res.status(200).json({
        message: "success",
        data: result,
    });
}));
const createUser = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const createdUser = yield userModel.create({ name, email, password });
    res.status(201).json({
        message: "success",
        userId: createdUser._id,
    });
}));
const updateUserById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    if (req.body.password) {
        const hashedPassword = yield bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword; // Replace plain-text password with hashed password
    }
    // console.log(req.body);
    const result = yield userModel.findByIdAndUpdate(userId, req.body, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        return next(new AppError('User not found', 404));
    }
    res.status(200).json({
        message: "success",
        data: result,
    });
}));
const deleteUserById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = new ObjectId(req.params.userId);
    const result = yield userModel.findByIdAndDelete(userId);
    if (!result) {
        return next(new AppError('User not found', 404));
    }
    res.status(204).json({
        message: "user deleted successfully",
    });
}));
const getAllUser = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const features = new APIFeatures(userModel.find().select('-_id -createdAt -password'), req.query);
    features.filter().sort().limitFields().paginate();
    const result = yield features.query;
    const limit = req.query.limit || 1;
    const totalUsers = yield userModel.countDocuments(features.query.getFilter());
    // Calculate total pages based on total number of products and specified limit
    const totalPages = Math.ceil(totalUsers / Number(limit));
    res.status(200).json({
        message: "success",
        totalPages,
        totalUsers,
        data: result,
    });
}));
const getMe = (req, res, next) => {
    if (req.user && req.user._id) {
        req.params.userId = req.user._id.toString();
        next();
    }
};
const updateProfilePhoto = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = new ObjectId(req.params.userId);
    // Check if files were uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'No images uploaded' });
    }
    const image = req.file.location;
    const result = yield userModel.findByIdAndUpdate(userId, {
        profilePhoto: image
    }, {
        new: true,
        runValidators: true
    });
    // console.log(result);
    if (!result) {
        return next(new AppError('User not found', 404));
    }
    // result.profilePhoto = url;
    res.status(200).json({
        message: "success",
        data: result,
    });
}));
export default {
    getAllUser,
    getUserById,
    updateUserById,
    deleteUserById,
    createUser,
    getMe,
    updateProfilePhoto
};
