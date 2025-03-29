import mongoose, { Document, Schema } from 'mongoose';

export interface Address extends Document {
  street: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

export const addressSchema = new Schema<Address>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pinCode: { type: String, required: true }
});

const AddressModel = mongoose.model<Address>('Address', addressSchema);

export default AddressModel;
