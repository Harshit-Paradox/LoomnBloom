import mongoose, { Schema } from "mongoose";
const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    subCategory: { type: [String] },
});
const CategoryModel = mongoose.model("Category", categorySchema);
export default CategoryModel;
