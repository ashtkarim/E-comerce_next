import mongoose, { Schema, model, Document } from "mongoose";

export interface IComment extends Document {
  productId: mongoose.Types.ObjectId;
  userName: string;
  text: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Comments = mongoose.models.Comments || model<IComment>("Comments", commentSchema);

export default Comments;
