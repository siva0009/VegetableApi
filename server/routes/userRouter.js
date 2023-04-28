import express from "express";
import expressAsyncHandler from "express-async-handler";
import crypto from "crypto";
import dotenv from "dotenv";
import { generateToken } from "../utils/index.js";

import User from "../models/userModel.js";
import isAuth from "../middleware/index.js";
import { sendText } from "../fastTwoSms/index.js";

const userRouter = express.Router();
dotenv.config();

const smsKey = process.env.SMS_SECRET_KEY;

userRouter.post("/sendOTP", (req, res) => {
  const phone = req.body.phone;
  const otp = Math.floor(1000 + Math.random() * 9000);
  const ttl = 2 * 60 * 1000;
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;
  const hash = crypto.createHmac("sha256", smsKey).update(data).digest("hex");
  const fullHash = `${hash}.${expires}`;

  sendText({ otp, numbers: phone });

  res.status(200).send({ hash: fullHash });
});

userRouter.post(
  "/verifyOTP",
  expressAsyncHandler(async (req, res) => {
    const phone = await req.body.phone;
    const hash = await req.body.hash;
    const otp = await req.body.otp;
    let [hashValue, expires] = hash.split(".");

    let now = Date.now();
    if (now > parseInt(expires)) {
      return res.status(504).send({ message: `Timeout please try again` });
    }
    const data = `${phone}.${otp}.${expires}`;
    const newCalculatedHash = crypto
      .createHmac("sha256", smsKey)
      .update(data)
      .digest("hex");

    if (newCalculatedHash === hashValue) {
      const user = await User.findOne({ phone: phone });
      if (user) {
        res.status(202).send({
          _id: user._id,
          phone: user.phone,
          userName: user.name,
          isAdmin: user.isAdmin,
          token: generateToken(user),
          message: `User Verification Successful`,
        });
      } else {
        const newUser = new User({
          phone: phone,
        });
        const createdUser = await newUser.save();
        res.status(201).send({
          _id: createdUser._id,
          phone: createdUser.phone,
          isAdmin: createdUser.isAdmin,
          token: generateToken(createdUser),
          message: `User Added and Verified Successful`,
        });
      }
    } else {
      return res
        .status(401)
        .send({ verification: false, message: `Incorrect OTP` });
    }
  })
);

userRouter.post(
  "/testuser",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById("6126786014588403c47f5024");
    res.status(202).send({
      _id: user._id,
      phone: user.phone,
      userName: user.name,
      isAdmin: user.isAdmin,
      token: generateToken(user),
      message: `User Verification Successful`,
    });
  })
);

userRouter.put(
  "/username",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(401).send({ message: "User not found!" });
    } else {
      user.name = req.body.name;
      await user.save();
      res.status(200).send(user.name);
    }
  })
);

export default userRouter;
