import mongoose, { Document, Schema } from "mongoose";

export interface Category extends Document {
	name: string;
	subCategory: Array<string>;
}

const categorySchema = new Schema<Category>({
	name: { type: String, required: true, unique: true },
	subCategory: { type: [String] },
});

const CategoryModel = mongoose.model<Category>("Category", categorySchema);

export default CategoryModel;
