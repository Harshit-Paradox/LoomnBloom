import { Request, Response, NextFunction } from "express";
import Order, { IOrder } from "../models/orders.js";
import AppError from "../utels/AppError.js";
import catchAsync from "../utels/CatchAsync.js";
import { CartModel } from "../models/cart.js";
import ProductModel, { Product, Variant } from "../models/Product.js";
import APIFeatures from "../utels/apiFeatures.js";

const getOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const orderId = req.params.orderId;
	const result = await Order.findOne({ orderId: orderId })
		.populate("userId")
		.populate("shippingAddress");

	if (!result) {
		return next(new AppError("Order not found", 404));
	}

	res.status(200).json({
		message: "success",
		data: result,
	});
});

const getOrdersOfUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	if (req.user && (req.user as any)._id) {
		req.params.userId = (req.user as any)._id.toString();
	}
	const user = req.params.userId;

	// Find orders by user ID
	const orders = await Order.find({ userId: user }).populate("shippingAddress");
	// If no orders found for the user, return a 404 error
	if (!orders || orders.length === 0) {
		return next(new AppError("Orders not found for the user", 404));
	}

	// Send success response with the orders
	res.status(200).json({
		message: "success",
		data: orders,
	});
});

const createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	if (req.user && (req.user as any)._id) {
		req.params.userId = (req.user as any)._id.toString();
	}
	const user = req.params.userId;
	const cart = await CartModel.findOne({ user });
	// console.log(user,cart);

	const lastDocument: IOrder | null = await Order.findOne({}, {}, { sort: { orderId: -1 } });
	const lastOrderId: string = lastDocument ? lastDocument.orderId : "THB0000"; // Default if no last order exists
	const numericPart = lastOrderId.slice(3);
	const newNumericPart = (parseInt(numericPart) + 1).toString().padStart(4, "0"); // Increment and pad with zeros
	const newOrderId = `THB${newNumericPart}`;

	const { paymentId, paymentSignature, status, shippingAddress } = req.body;

	const createdOrder = await Order.create({
		orderId: newOrderId,
		userId: user,
		cart,
		paymentId,
		paymentSignature,
		status,
		shippingAddress,
	});
	await updateProductStockAndSales(cart?.products);

	await CartModel.findByIdAndUpdate(cart?._id, {
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
});

const updateOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const orderId = req.params.orderId;
	const result = await Order.findOneAndUpdate({ orderId: orderId }, req.body, {
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
});

const deleteOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const orderId = req.params.orderId;
	const result = await Order.findOneAndDelete({ orderId: orderId });

	if (!result) {
		return next(new AppError("Order not found", 404));
	}

	res.status(204).json({
		message: "Order deleted successfully",
	});
});

const getAllOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	// const orders = await Order.find().populate('userId').populate('shippingAddress');
	const features = new APIFeatures(
		Order.find().populate("userId").populate("shippingAddress"),
		req.query
	);
	features.filter().sort("orderId").limitFields().paginate();
	const result = await features.query;
	const limit = req.query.limit || 1;
	const totalOrders = await Order.countDocuments(features.query.getFilter());

	// Calculate total pages based on total number of products and specified limit
	const totalPages = Math.ceil(totalOrders / Number(limit));

	res.status(200).json({
		message: "success",
		totalOrders,
		totalPages,

		data: result,
	});
});

const updateProductStockAndSales = async (
	productsMap: Map<String, { product: Product; variant: Variant; quantity: number }> | undefined
) => {
	if (!productsMap) return;

	for (const [pid, cartProduct] of productsMap) {
		const { product, variant, quantity } = cartProduct;
		const dbProduct = await ProductModel.findOne({ pid: product.pid });
		if (!dbProduct) {
			throw new Error(`Product with pid ${pid} not found`);
		}
		const productVariant = dbProduct.variants.find((v) => v.color === variant.color);
		if (!productVariant) {
			throw new Error(
				`Variant with color ${variant.color} not found in product ${dbProduct.productName}`
			);
		}

		productVariant.stock -= quantity;
		dbProduct.totalSales = (dbProduct.totalSales || 0) + quantity;
		dbProduct.qtyavailable = (dbProduct.qtyavailable || 0) - quantity;

		await dbProduct.save();
	}
};

export default {
	getOrderById,
	createOrder,
	updateOrderById,
	deleteOrderById,
	getAllOrders,
	getOrdersOfUser,
};
