import { Schema, model, models, Document } from 'mongoose';

export interface ICategory extends Document {
  title: string;
  desc?: string;
  state: boolean;
}

const categorySchema = new Schema<ICategory>({
  title: { type: String, required: true },
  desc: String,
  state: { type: Boolean, default: true },
});

// Check if model already exists to avoid OverwriteModelError
const Category = models.Category || model<ICategory>('Category', categorySchema);

export default Category;
