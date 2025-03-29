import { ObjectId } from "mongodb";
import { Request, Response,NextFunction } from "express";
import {userModel} from "../models/User.js";
import AppError from "../utels/AppError.js";
import APIFeatures from "../utels/apiFeatures.js";
import { NewUserRequestBody } from "../types/requestBody.js";
import catchAsync from "../utels/CatchAsync.js";
import bcrypt from 'bcryptjs';


const getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  const result = await userModel.findById(userId);

  if (!result) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    message: "success",
    data: result,
  });
});

const createUser = catchAsync(async (req: Request<{},{},NewUserRequestBody>, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const createdUser = await userModel.create({ name, email, password });
  res.status(201).json({
    message: "success",
    userId: createdUser._id,
  });
});

const updateUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  if (req.body.password) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword; // Replace plain-text password with hashed password
  }

  // console.log(req.body);
  const result = await userModel.findByIdAndUpdate(userId, req.body, {
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
});

const deleteUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = new ObjectId(req.params.userId);
  const result = await userModel.findByIdAndDelete(userId);
  if (!result) {
    return next(new AppError('User not found', 404));
  }
  res.status(204).json({
    message: "user deleted successfully",
  });
});

const getAllUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const features = new APIFeatures(userModel.find().select('-_id -createdAt -password'), req.query);
  features.filter().sort().limitFields().paginate();
  const result = await features.query;
  const limit = req.query.limit || 1;
  const totalUsers = await userModel.countDocuments(features.query.getFilter());

  // Calculate total pages based on total number of products and specified limit
  const totalPages = Math.ceil(totalUsers / Number(limit));
  res.status(200).json({
    message: "success",
    totalPages,
    totalUsers,
    data: result,
  });
});

const getMe = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user as any)._id) {
    req.params.userId = (req.user as any)._id.toString();
    next();
  }
};

const updateProfilePhoto = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = new ObjectId(req.params.userId);
  // Check if files were uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No images uploaded' });
  }
  const image = (req.file as any).location;
  const result = await userModel.findByIdAndUpdate(userId, {
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
});

export default {
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
  createUser,
  getMe,
  updateProfilePhoto
};

