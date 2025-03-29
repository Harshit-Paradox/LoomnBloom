var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import productModel from "../models/Product.js";
import AppError from "../utels/AppError.js";
import APIFeatures from "../utels/apiFeatures.js";
import catchAsync from "../utels/CatchAsync.js";
const getProductById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    const result = yield productModel.findOne({ pid: productId });
    if (!result) {
        return next(new AppError("Product not found", 404));
    }
    res.status(200).json({
        message: "success",
        data: result,
    });
}));
const createProduct = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productName, description, category, subCategory, price, status } = req.body;
    const lastDocument = yield productModel.findOne({}, {}, { sort: { pid: -1 } });
    const lastPid = lastDocument ? lastDocument.pid : 0;
    let images;
    // Check if files were uploaded
    if (!req.files || !("images" in req.files)) {
        images = [
            {
                location: "https://haatbazaar-data.s3.ap-south-1.amazonaws.com/uploads/product_images/u_IMG_2712-1729278695387.jpeg",
            },
        ];
    }
    else {
        // Get the uploaded images
        images = req.files["images"];
    }
    // Parse variants from stringified JSON
    let variants;
    try {
        variants = JSON.parse(req.body.variants);
    }
    catch (error) {
        return res.status(400).json({ message: "Invalid variants format" });
    }
    // If you're expecting multiple images, you can store their paths in an array
    const imagePaths = images.map((image) => image.location);
    let qty = 0;
    variants.map((s) => (qty = qty + s.stock));
    const createdProduct = yield productModel.create({
        pid: lastPid + 1,
        productName,
        description,
        category,
        subCategory,
        price,
        qtyavailable: qty,
        variants,
        status,
        images: imagePaths,
    });
    res.status(201).json({
        message: "success",
        productId: createdProduct._id,
    });
}));
const updateProductById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    const { productName, description, category, subCategory, price, status } = req.body;
    let images;
    // Check if files were uploaded
    if (!req.files || !("newImages" in req.files)) {
        images = [{}];
    }
    else {
        // Get the uploaded images
        images = req.files["newImages"];
    }
    // Parse variants from stringified JSON
    let variants;
    try {
        variants = JSON.parse(req.body.variants); // Assuming variants are received as a JSON string
    }
    catch (error) {
        return res.status(400).json({ message: "Invalid variants format" });
    }
    const allImagePaths = [];
    // Ensure req.body.images is an array
    if (req.body.images != null) {
        // Add existing images to the allImagePaths array
        const h = JSON.parse(req.body.images);
        h.forEach((e) => {
            allImagePaths.push(e);
        });
        // allImagePaths.push(...req.body.images);
    }
    // If you're expecting multiple images, you can store their paths in an array
    const imagePaths = images.map((image) => image.location);
    let qty = 0;
    variants.map((s) => (qty = qty + s.stock));
    allImagePaths.push(...imagePaths);
    const updatedProduct = yield productModel.findOneAndUpdate({ pid: productId }, {
        productName,
        description,
        category,
        subCategory,
        price,
        qtyavailable: qty,
        variants,
        status,
        images: allImagePaths,
    }, {
        new: true,
        runValidators: true,
    });
    if (!updatedProduct) {
        return next(new AppError("Product not found", 404));
    }
    res.status(200).json({
        message: "success",
        data: updatedProduct,
    });
}));
// Function to update product images by productId
const updateProductImagesById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    // Check if files were uploaded
    if (!req.files || !("images" in req.files)) {
        return res.status(400).json({ message: "No images uploaded" });
    }
    // Get the uploaded images
    const images = req.files["images"];
    // Get the paths of the uploaded images
    const imagePaths = images.map((image) => {
        return image.location || "";
    });
    const updatedProduct = yield productModel.findOneAndUpdate({ pid: productId }, { $push: { images: { $each: imagePaths } } }, {
        new: true,
        runValidators: true,
    });
    // Check if the product was not found
    if (!updatedProduct) {
        return next(new AppError("Product not found", 404));
    }
    // Send the updated product in the response
    res.status(200).json({
        message: "success",
        data: updatedProduct,
    });
}));
const deleteProductById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    const result = yield productModel.findOneAndDelete({ pid: productId });
    if (!result) {
        return next(new AppError("Product not found", 404));
    }
    res.status(204).json({
        message: "Product deleted successfully",
    });
}));
const getAllProducts = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const features = new APIFeatures(productModel.find(), req.query);
    features.filter().sort("pid").limitFields().paginate();
    // console.log(req.query);
    const result = yield features.query;
    const limit = req.query.limit || 1;
    // console.log(limit);
    // console.log(features);
    // Count total number of products from the database instead of result length
    const totalProducts = yield productModel.countDocuments(features.query.getFilter());
    // Calculate total pages based on total number of products and specified limit
    const totalPages = Math.ceil(totalProducts / Number(limit));
    // console.log(totalPages);
    res.status(200).json({
        message: "success",
        totalPages,
        totalProducts,
        data: result,
    });
}));
const getNewProducts = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newProducts = yield productModel.find().sort({ addedAt: -1 }).limit(10); // Assuming you have a 'createdAt' field
    res.status(200).json({
        message: "success",
        data: newProducts,
    });
}));
const getBestSellers = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bestSellers = yield productModel.find().sort({ totalSales: -1 }).limit(10);
    res.status(200).json({
        message: "success",
        data: bestSellers,
    });
}));
const searchProducts = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.name; // Extract search query from request parameters
    // Construct Mongoose query to search for products
    const results = yield productModel.find({
        $or: [
            { productName: { $regex: query, $options: "i" } }, // Case-insensitive search by name
            // { description: { $regex: query, $options: 'i' } }, // Case-insensitive search by description
            // You can add more fields to search here if needed
        ],
    });
    // If no products are found, return a 404 error
    if (results.length === 0) {
        return next(new AppError("No products found", 404));
    }
    // Return search results
    res.status(200).json({
        message: "success",
        data: results,
    });
}));
export default {
    getProductById,
    createProduct,
    updateProductById,
    deleteProductById,
    getAllProducts,
    getNewProducts,
    getBestSellers,
    searchProducts,
    updateProductImagesById,
};
