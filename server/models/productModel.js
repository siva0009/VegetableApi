import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
  purchasing: { type: Boolean, required: true },
  unit: { type: String, required: true },
  description: { type: String, required: true },
  nutrient: { type: String, required: true },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
