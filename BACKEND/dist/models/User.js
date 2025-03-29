import mongoose from "mongoose";
import { addressSchema } from "./Address.js";
const userSchema = new mongoose.Schema({
    //  _id : mongoose.Schema.Types.ObjectId,
    // id:{type: Number,required:true,unique: true},
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePhoto: { type: String, default: '' },
    password: { type: String, required: true },
    address: { type: [addressSchema], },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now() },
}, {
    strict: 'throw'
});
const userModel = mongoose.model('user', userSchema);
export { userModel };
