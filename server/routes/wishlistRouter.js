import expressAsyncHandler from "express-async-handler";
import express from "express";

import Wishlist from "../models/wishlistModal.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import isAuth from "../middleware/index.js";

const wishlistRouter = express.Router();

wishlistRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const wishlist = await Wishlist.find({ user: req.user._id });

    const wishlistItem = wishlist.find((x) => x.product == req.body.id);

    if (wishlistItem) {
      res.status(400).send({ message: "Product is alredy in wishlist!" });
    } else {
      const product = await Product.findById(req.body.id);
      const user = await User.findById(req.user._id);
      const wishlist = new Wishlist({
        product,
        user,
      });
      const newWishlist = await wishlist.save();
      res.status(201).send({ product: newWishlist });
    }
  })
);

wishlistRouter.get(
  "/mywishlist",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const wishlist = await Wishlist.find({ user: req.user._id });
    res.send(wishlist);
  })
);

wishlistRouter.delete(
  "/remove",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const wishlist = await Wishlist.find({ user: req.user._id });

    const wishlistItem = wishlist.find((x) => x.product == req.body.id);

    if (wishlistItem) {
      const product = await Product.findById(req.body.id);

      await wishlistItem.deleteOne({ product: req.body.id });

      res.status(201).send({ message: "Removed from wishlist deleted!" });
    } else {
      res.status(400).send({ message: "Product is not found!" });
    }
  })
);

export default wishlistRouter;
