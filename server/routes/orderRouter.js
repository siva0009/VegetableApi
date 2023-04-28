import expressAsyncHandler from "express-async-handler";
import express from "express";

import Order from "../models/orderModal.js";
import User from "../models/userModel.js";
import isAuth from "../middleware/index.js";

const orderRouter = express.Router();

orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.body.orderItems.length === 0) {
      res.status(400).send({ message: "Please add some products!" });
    } else {
      const order = new Order({
        orderItems: req.body.orderItems,
        customerAddress: req.body.customerAddress,
        itemsPrice: req.body.cartTotal,
        taxPrice: req.body.taxes,
        shippingPrice: req.body.shippingPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,
        isPaid: req.body.isPaid,
      });

      const newOrder = await order.save();
      res.status(201).send({ message: "New Order Received", order: newOrder });
    }
  })
);

orderRouter.get(
  "/myorders",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

export default orderRouter;
