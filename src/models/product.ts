import { Schema, model, models, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  desc?: string;
  imageLink: string;
  price: number;
  state: boolean;
  createdAt: Date;
  showcase: boolean;
  catId?: Types.ObjectId;
}

const productSchema = new Schema<IProduct>({
  title: { type: String, required: true },
  desc: String,
  imageLink: { type: String, required: true },
  price: { type: Number, default: 0 },
  state: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  showcase: { type: Boolean, default: true },
  catId: { type: Schema.Types.ObjectId, ref: 'Category' },
});

// Avoid overwriting the model if it already exists
const Product = models.Product || model<IProduct>('Product', productSchema);

export default Product;
