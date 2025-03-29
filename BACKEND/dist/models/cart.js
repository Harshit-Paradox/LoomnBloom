import mongoose, { Schema } from "mongoose";
import { productSchema } from "../models/Product.js";
// Define the schema for the cart
const cartSchema = new Schema({
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
const CartModel = mongoose.model("Cart", cartSchema);
export { CartModel, cartSchema };
