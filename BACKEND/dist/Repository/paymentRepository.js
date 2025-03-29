var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import CatchAsync from "../utels/CatchAsync.js";
import crypto from "crypto";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { CartModel } from "../models/cart.js";
dotenv.config({ path: "config.env" });
const razorpay = new Razorpay({
    key_id: process.env.razorpay_key_id || "razorpay-key",
    key_secret: process.env.razorpay_key_secret || "razorpay-secret",
});
const acceptPayment = CatchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user && req.user._id) {
        req.params.userId = req.user._id.toString();
    }
    const user = req.params.userId;
    const cart = yield CartModel.findOne({ user });
    const payablePrice = (cart === null || cart === void 0 ? void 0 : cart.payablePrice) || 0;
    const roundedPayablePrice = Math.round(payablePrice * 100) / 100;
    const amount = roundedPayablePrice * 100;
    const options = {
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };
    const order = yield razorpay.orders.create(options);
    res.status(200).json({
        message: "success",
        data: order,
    });
}));
const verifyPayment = CatchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const generated_signature = crypto
        .createHmac("sha256", process.env.razorpay_key_secret || "D5jABVkIJrLinbT3teJnUgA5")
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
    if (generated_signature === razorpay_signature) {
        res.status(200).json({ success: true, message: "Payment verified successfully" });
    }
    else {
        res.status(400).json({ success: false, message: "Payment verification failed" });
    }
}));
export default { acceptPayment, verifyPayment };
