import { Request, Response, NextFunction } from "express";
import { CartModel, CartDocument } from "../models/cart.js";
import AppError from "../utels/AppError.js";
import catchAsync from "../utels/CatchAsync.js";
import Product from "../models/Product.js";
import ProductModel from "../models/Product.js";

const getCartById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const cartId = req.params.cartId;
	const result = await CartModel.findById(cartId);
	// console.log(result);
	if (!result) {
		return next(new AppError("Cart not found", 404));
	}

	res.status(200).json({
		message: "success",
		data: result,
	});
});

const createCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const { products, deliveryCharges, gst, totalQuantity, totalPrice, payablePrice, user } =
		req.body;
	const createdCart = await CartModel.create({
		products,
		deliveryCharges,
		gst,
		totalQuantity,
		totalPrice,
		payablePrice,
		user,
	});
	res.status(201).json({
		message: "success",
		cartId: createdCart._id,
	});
});

const updateCartById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const cartId = req.params.cartId;
	const result = await CartModel.findByIdAndUpdate(cartId, req.body, {
		new: true,
		runValidators: true,
	});

	if (!result) {
		return next(new AppError("Cart not found", 404));
	}

	res.status(200).json({
		message: "success",
		data: result,
	});
});

const deleteCartById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const cartId = req.params.cartId;
	const result = await CartModel.findByIdAndDelete(cartId);

	if (!result) {
		return next(new AppError("Cart not found", 404));
	}

	res.status(204).json({
		message: "Cart deleted successfully",
	});
});

const getAllCarts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const carts = await CartModel.find().populate("user");
	res.status(200).json({
		message: "success",
		data: carts,
	});
});

const addToCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	if (req.user && (req.user as any)._id) {
		req.params.userId = (req.user as any)._id.toString();
	}

	const pid = req.body.pid;
	const selectedVariant = req.body.variant; // Assuming variant is passed in request body
	const user = req.params.userId;

	const cart = await CartModel.findOne({ user });
	const product = await Product.findOne({ pid });

	if (!product) {
		return next(new AppError("Product not found", 404));
	}

	// Check if the selected variant exists
	const variant = product.variants.find((v) => v.color === selectedVariant.color);
	if (!variant) {
		return next(new AppError("Variant not found", 404));
	}

	// Check if the variant has stock
	if (variant.stock <= 0) {
		return next(new AppError("Variant out of stock", 400));
	}

	// Sanitize the key
	const Key = sanitizeKey(pid + variant.color);

	if (cart) {
		if (cart.products && cart.products.has(Key)) {
			const cartProduct = cart.products.get(Key);

			// Check if the existing product's variants contain the selected variant color
			const existingVariant = cartProduct?.variant.color === selectedVariant.color;
			if (existingVariant) {
				return next(new AppError("Product variant already exists in the cart", 400));
			}
		}

		// Add the product variant to the cart
		cart.products = cart.products || new Map();
		cart.products.set(Key, { product, variant: selectedVariant, quantity: 1 });

		const productPrice = product.price;
		cart.totalQuantity = (cart.totalQuantity || 0) + 1;
		cart.totalPrice = (cart.totalPrice || 0) + productPrice;

		cart.gst = cart.totalPrice * 0.03;
		cart.deliveryCharges = cart.totalPrice > 3000 ? 0 : 50;
		cart.payablePrice = cart.totalPrice + cart.gst + cart.deliveryCharges;

		await cart.save();
	}

	res.status(200).json({ message: "success", data: cart });
	next();
});

const removeFromCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	if (req.user && (req.user as any)._id) {
		req.params.userId = (req.user as any)._id.toString();
	}

	const pid = req.body.pid; // Assuming pid is sent in the request body
	const selectedVariant = req.body.variant; // Assuming variant info is also passed
	const user = req.params.userId;

	// Find the cart for the current user
	const cart = await CartModel.findOne({ user });

	if (!cart) {
		return next(new AppError("Cart not found", 404));
	}

	// Sanitize the key
	const Key = sanitizeKey(pid + selectedVariant.color);
	// Check if the product is in the cart
	if (cart.products && cart.products.has(Key)) {
		const cartProduct = cart.products.get(Key);

		if (!cartProduct) {
			return next(new AppError("Product not found in cart", 404));
		}

		// Check if the variant exists for the product in the cart
		if (cartProduct.variant.color !== selectedVariant.color) {
			return next(new AppError("Product variant not found in cart", 404));
		}

		// Remove the product from the cart
		const product = await Product.findOne({ pid });

		if (!product) {
			return next(new AppError("Product not found", 404));
		}

		// Calculate quantity and price to adjust the cart
		const productQuantity = cartProduct.quantity || 1;
		const productPrice = product.price || 0;

		// Remove the product from the cart
		cart.products.delete(Key);

		// Update cart totals
		cart.totalQuantity = cart.totalQuantity - productQuantity;
		cart.totalPrice = cart.totalPrice - productPrice * productQuantity;

		// Recalculate GST and delivery charges
		cart.gst = cart.totalPrice * 0.03;
		cart.deliveryCharges = cart.totalPrice > 3000 ? 0 : 50;
		cart.payablePrice = cart.totalPrice + cart.gst + cart.deliveryCharges;

		// Save the updated cart
		await cart.save();

		return res.status(200).json({ message: "success", data: cart });
	} else {
		return next(new AppError("Product not found in cart", 404));
	}
});

const updateCartQuantity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	if (req.user && (req.user as any)._id) {
		req.params.userId = (req.user as any)._id.toString();
	}
	const { pid, variant, quantity } = req.body; // Assuming pid and quantity are sent in the request body
	const user = req.params.userId;

	const cart = await CartModel.findOne({ user });
	const product = await ProductModel.findOne({ pid });

	if (!product) {
		return next(new AppError("Product not found", 404));
	}

	// Sanitize the key
	const Key = sanitizeKey(pid + variant.color);

	if (!cart) {
		return next(new AppError("Cart not found", 404));
	} else {
		// Check if the product is in the cart
		if (cart.products && cart.products.has(Key)) {
			// Update the quantity of the product in the cart
			const productDetails = cart.products.get(Key);
			if (productDetails) {
				const productVariant = product.variants.find((v) => v.color === variant.color);
				if (!productVariant) {
					return next(new AppError("Variant not found", 404));
				}
				if (quantity > productVariant.stock) {
					return next(
						new AppError(
							`Insufficient stock. Available stock for this variant is ${productVariant.stock}.`,
							400
						)
					);
				}
				const previousQuantity = productDetails.quantity; // Assuming productDetails is an array
				const productPrice = productDetails.product.price; // Assuming productDetails is an array

				// Update the quantity and calculate the price difference
				const quantityDifference = quantity - previousQuantity;
				productDetails.quantity = quantity;

				// Update totalQuantity and totalPrice
				cart.totalQuantity += quantityDifference;
				cart.totalPrice += productPrice * quantityDifference;

				cart.gst = cart.totalPrice * 0.03;
				if (cart.totalPrice > 3000) {
					cart.deliveryCharges = 0;
				} else {
					cart.deliveryCharges = 50;
				}

				cart.payablePrice = cart.totalPrice + cart.gst + cart.deliveryCharges;
			}

			// Save the updated cart
			await cart.save();

			return res.status(200).json({ message: "success", data: cart });
		} else {
			return next(new AppError("Product not found in cart", 404));
		}
	}
});

const getMyCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	if (req.user && (req.user as any)._id) {
		req.params.userId = (req.user as any)._id.toString();
	}
	const user = req.params.userId;
	const cart = await CartModel.findOne({ user });
	res.status(200).json({
		message: "success",
		data: cart,
	});
});

function sanitizeKey(key: string): string {
	return key.replace(/\./g, "_"); // Replace all dots with underscores
}

export default {
	getCartById,
	createCart,
	updateCartById,
	deleteCartById,
	getAllCarts,
	addToCart,
	removeFromCart,
	updateCartQuantity,
	getMyCart,
};
