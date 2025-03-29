import { ObjectId } from "mongodb";
import mongoose, { Document, Schema } from "mongoose";
import {Address, addressSchema} from "./Address.js";

// Define the interface for the user document
interface UserDocument extends Document {
  _id: ObjectId;
  // id: number;
  name: string;
  email: string;
  profilePhoto: string;
  password: string;
  address: Address[];
  role: string;
  createdAt: Date;
}


const userSchema = new mongoose.Schema({
  //  _id : mongoose.Schema.Types.ObjectId,
  // id:{type: Number,required:true,unique: true},
  name: { type: String, required: true },
  email: { type: String, required: true,unique: true },
  profilePhoto: { type: String , default: ''},
  password: { type: String, required: true },
  address: {type: [addressSchema] , },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now() },
},
{
     strict: 'throw'
}
)

const userModel = mongoose.model<UserDocument>('user',userSchema);

export {userModel,UserDocument};

