import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { productSchema, Product, Variant } from "../models/Product.js";

// Define a schema for the cart item
// interface CartItem {
//   product: Product; // Reference to the product
//   quantity: number; // Quantity of the product in the cart
// }

// Define a schema for the cart
interface CartDocument extends Document {
	products: Map<String, { product: Product; variant: Variant; quantity: number }>;
	deliveryCharges: number; // Delivery charges
	gst: number; // Goods and Services Tax (GST)
	totalQuantity: number; // Total quantity of all items in the cart
	totalPrice: number; // Total price of all items in the cart
	payablePrice: number; // Payable price including GST and delivery charges\
	user: ObjectId; // User ID who owns this cart
}

// Define the schema for the cart
const cartSchema = new Schema<CartDocument>({
	products: {
		type: Map,
		of: {
			product: { type: productSchema }, // Reference to the product
			variant: { type: Object },
			quantity: { type: Number, default: 1 }, // Default quantity is 1
		},
	},
	deliveryCharges: { type: Number },
	gst: { type: Number },
	totalQuantity: { type: Number },
	totalPrice: { type: Number },
	payablePrice: { type: Number }, // Calculated on-the-fly if not provided
	user: { type: Schema.Types.ObjectId, ref: "user" }, // User who owns this cart
});

// Create your cart model
const CartModel = mongoose.model<CartDocument>("Cart", cartSchema);

export { CartModel, cartSchema, CartDocument };
