import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import productRouter from "./server/routes/productRouter.js";
import userRouter from "./server/routes/userRouter.js";
import orderRouter from "./server/routes/orderRouter.js";
import wishlistRouter from "./server/routes/wishlistRouter.js";

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Set up a whitelist and check against it:
const isDomainAllowed = (origin, domains) => {
  let isAllowed = false;
  domains?.forEach((domain) => {
    if (origin?.includes(domain)) {
      isAllowed = true;
    }
  });
  return isAllowed;
};

// Set up a whitelist and check against it:
var corsOptionsDelegate = function (req, callback) {
  const allowlist = ["veggiesshop.netlify.app", "localhost"];
  var corsOptions;
  if (isDomainAllowed(req?.header("Origin"), allowlist)) {
    corsOptions = { origin: true, credentials: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

// Then pass them to cors:
app.use(cors(corsOptionsDelegate));

mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost/VeggiesEcom", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Routers
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/wishlist", wishlistRouter);

app.get("/api/config/paypal", (req, res) => {
  res.send(process.env.PAYPAL_Client_ID);
});

// Server route
app.get("/", (req, res) => {
  res.send("Service up and running!");
});

// Set up the ChatGPT endpoint
app.post("/chat", async (req, res) => {
  // Get the prompt from the request
  const { prompt } = req.body;

  // Generate a response with ChatGPT
  // const completion = await openai.createCompletion({
  //   model: "text-davinci-002",
  //   prompt: prompt,
  // });

  const completion = await openai.createCompletion({
  model:"text-davinci-003",
  prompt:prompt,
  max_tokens:200
  });
  console.log(completion.data.choices)
  let response = ''
  completion.data.choices.forEach((c) => {
    response = response + " " + c.text
  });
  res.send(response)
  // res.send(completion.data.choices[0].text);
});

// Middleware for sending an error message to front
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
  next();
});

const port = process.env.PORT || 9000;

// Starting a Server
app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
