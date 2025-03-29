import mongoose, { Schema } from 'mongoose';
export const addressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pinCode: { type: String, required: true }
});
const AddressModel = mongoose.model('Address', addressSchema);
export default AddressModel;
