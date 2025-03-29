var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose, { Schema } from 'mongoose';
import CategoryModel from './category.js';
export const productSchema = new Schema({
    pid: { type: Number, required: true, unique: true },
    productName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }, // Define without validation first
    subCategory: { type: [String] },
    images: { type: [String], default: [] },
    variants: [{
            color: { type: String, required: true },
            stock: { type: Number, required: true }
        }],
    status: { type: String, enum: ['active', 'deactive', 'draft'], default: 'active' },
    totalSales: { type: Number, default: 0 },
    qtyavailable: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
}, {
    strict: 'throw'
});
// Add validation logic separately
// productSchema.path('category').validate({
//   validator: async function (categoryName: string) {
//     const category = await CategoryModel.findOne({ name: categoryName });
//     return !!category;
//   },
//   message: 'Category does not exist'
// });
// productSchema.path('subCategory').validate({
//   validator: async function (subCategoryName: string) {
//     console.log(`Validating subCategory: ${subCategoryName} under category: ${this.category}`);
//     const category = await CategoryModel.findOne({ name: this.category});
//     console.log(category);
//     return category && category.subCategory.includes(subCategoryName);
//     // return !!category;
//   },
//   message: 'Subcategory does not exist under the provided category'
// });
productSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.category) {
            // Validate category
            const category = yield CategoryModel.findOne({ name: this.category });
            if (!category) {
                return next(new Error('Category does not exist'));
            }
        }
        if (this.subCategory && Array.isArray(this.subCategory)) {
            // Validate subCategory array
            const category = yield CategoryModel.findOne({ name: this.category });
            if (category && category.subCategory) {
                // Ensure all provided subcategories exist under the category
                const invalidSubCategories = this.subCategory.filter((subCat) => !category.subCategory.includes(subCat));
                if (invalidSubCategories.length > 0) {
                    return next(new Error(`The following subcategories do not exist under the provided category: ${invalidSubCategories.join(', ')}`));
                }
            }
            else {
                return next(new Error('Category does not exist for the given subcategories'));
            }
        }
        else if (this.subCategory) {
            return next(new Error('SubCategory must be an array of strings'));
        }
        next();
    });
});
const ProductModel = mongoose.model('Product', productSchema);
export default ProductModel;
