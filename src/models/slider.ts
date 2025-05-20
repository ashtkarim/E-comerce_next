import { Schema, model, models, Document } from 'mongoose';

export interface ISlider extends Document {
  title: string;
  link: string;
  imageLink: string;
}

const sliderSchema = new Schema<ISlider>({
  title: { type: String, required: true },
  link: { type: String, required: true },
  imageLink: { type: String, required: true },
});

// Check if model exists before creating it
const Slider = models.Slider || model<ISlider>('Slider', sliderSchema);

export default Slider;
