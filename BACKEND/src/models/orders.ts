import mongoose, { Document, Schema, Types} from 'mongoose';
import {Address, addressSchema} from './Address.js';
import { CartDocument, CartModel, cartSchema } from './cart.js';

export interface IOrder extends Document {
  orderId: string;
  userId: Types.ObjectId ; // Reference to user schema
  cart: CartDocument ; // Reference to cart schema
  paymentId: string;
  paymentSignature: string;
  status: string;
  shippingAddress: Address; // Reference to address schema
  createdAt: Date;
}

const orderSchema: Schema<IOrder> = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  cart: cartSchema,
  paymentId: { type: String, required: true },
  paymentSignature: { type: String, required: true },
  status: { type: String, enum: ['Order Placed','confirmed', 'processing', 'shipped', 'delivered', 'cancelled','pending'], default: 'Order Placed' },
  shippingAddress: {type:addressSchema,required:true},
  createdAt: { type: Date, default: Date.now() } // Default to current date/time
}

);

// // Middleware to set orderId field to match _id field before saving
// orderSchema.pre<IOrder>('save', function(next) {
//   // Check if orderId is not already set
//   if (!this.orderId) {
//     // Set orderId to match _id
//     this.orderId = this._id;
//     // console.log("orderid " + this.orderId);
//   }
//   next();
// });

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;