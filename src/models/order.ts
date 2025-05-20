import { Schema, model, models, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  clientName: string;
  clientPhone: string;
  clientAdress: string;
  state: string;
  createdAt: Date;
  productId?: Types.ObjectId;
}

const orderSchema = new Schema<IOrder>({
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  clientAdress: { type: String, required: true },
  state: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
});

// Check if the model exists to avoid overwrite errors
const Order = models.Order || model<IOrder>('Order', orderSchema);

export default Order;
