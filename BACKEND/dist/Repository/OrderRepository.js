var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Order from "../models/orders.js";
import AppError from "../utels/AppError.js";
import catchAsync from "../utels/CatchAsync.js";
import { CartModel } from "../models/cart.js";
import ProductModel from "../models/Product.js";
import APIFeatures from "../utels/apiFeatures.js";
const getOrderById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.orderId;
    const result = yield Order.findOne({ orderId: orderId })
        .populate("userId")
        .populate("shippingAddress");
    if (!result) {
        return next(new AppError("Order not found", 404));
    }
    res.status(200).json({
        message: "success",
        data: result,
    });
}));
const getOrdersOfUser = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user && req.user._id) {
        req.params.userId = req.user._id.toString();
    }
    const user = req.params.userId;
    // Find orders by user ID
    const orders = yield Order.find({ userId: user }).populate("shippingAddress");
    // If no orders found for the user, return a 404 error
    if (!orders || orders.length === 0) {
        return next(new AppError("Orders not found for the user", 404));
    }
    // Send success response with the orders
    res.status(200).json({
        message: "success",
        data: orders,
    });
}));
const createOrder = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user && req.user._id) {
        req.params.userId = req.user._id.toString();
    }
    const user = req.params.userId;
    const cart = yield CartModel.findOne({ user });
    // console.log(user,cart);
    const lastDocument = yield Order.findOne({}, {}, { sort: { orderId: -1 } });
    const lastOrderId = lastDocument ? lastDocument.orderId : "THB0000"; // Default if no last order exists
    const numericPart = lastOrderId.slice(3);
    const newNumericPart = (parseInt(numericPart) + 1).toString().padStart(4, "0"); // Increment and pad with zeros
    const newOrderId = `THB${newNumericPart}`;
    const { paymentId, paymentSignature, status, shippingAddress } = req.body;
    const createdOrder = yield Order.create({
        orderId: newOrderId,
        userId: user,
        cart,
        paymentId,
        paymentSignature,
        status,
        shippingAddress,
    });
    yield updateProductStockAndSales(cart === null || cart === void 0 ? void 0 : cart.products);
    yield CartModel.findByIdAndUpdate(cart === null || cart === void 0 ? void 0 : cart._id, {
        products: {}, // Empty the Map of products
        totalQuantity: 0, // Reset total quantity to 0
        totalPrice: 0, // Reset total price to 0
        payablePrice: 0, // Reset payable price to 0
        gst: 0,
        deliveryCharges: 0,
    });
    res.status(201).json({
        message: "success",
        orderId: createdOrder._id,
    });
}));
const updateOrderById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.orderId;
    const result = yield Order.findOneAndUpdate({ orderId: orderId }, req.body, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        return next(new AppError("Order not found", 404));
    }
    res.status(200).json({
        message: "success",
        data: result,
    });
}));
const deleteOrderById = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.orderId;
    const result = yield Order.findOneAndDelete({ orderId: orderId });
    if (!result) {
        return next(new AppError("Order not found", 404));
    }
    res.status(204).json({
        message: "Order deleted successfully",
    });
}));
const getAllOrders = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const orders = await Order.find().populate('userId').populate('shippingAddress');
    const features = new APIFeatures(Order.find().populate("userId").populate("shippingAddress"), req.query);
    features.filter().sort("orderId").limitFields().paginate();
    const result = yield features.query;
    const limit = req.query.limit || 1;
    const totalOrders = yield Order.countDocuments(features.query.getFilter());
    // Calculate total pages based on total number of products and specified limit
    const totalPages = Math.ceil(totalOrders / Number(limit));
    res.status(200).json({
        message: "success",
        totalOrders,
        totalPages,
        data: result,
    });
}));
const updateProductStockAndSales = (productsMap) => __awaiter(void 0, void 0, void 0, function* () {
    if (!productsMap)
        return;
    for (const [pid, cartProduct] of productsMap) {
        const { product, variant, quantity } = cartProduct;
        const dbProduct = yield ProductModel.findOne({ pid: product.pid });
        if (!dbProduct) {
            throw new Error(`Product with pid ${pid} not found`);
        }
        const productVariant = dbProduct.variants.find((v) => v.color === variant.color);
        if (!productVariant) {
            throw new Error(`Variant with color ${variant.color} not found in product ${dbProduct.productName}`);
        }
        productVariant.stock -= quantity;
        dbProduct.totalSales = (dbProduct.totalSales || 0) + quantity;
        dbProduct.qtyavailable = (dbProduct.qtyavailable || 0) - quantity;
        yield dbProduct.save();
    }
});
export default {
    getOrderById,
    createOrder,
    updateOrderById,
    deleteOrderById,
    getAllOrders,
    getOrdersOfUser,
};
