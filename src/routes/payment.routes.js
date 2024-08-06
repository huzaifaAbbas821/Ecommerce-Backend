import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middle.js";
import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import stripePackage from 'stripe';
import dotenv from 'dotenv';


dotenv.config();

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

const router = Router();

router.route("/create-payment-intent").post(verifyJWT, asyncHandler(async(req,res) => {

    const { amount } = req.body;
  
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
  
      res.status(200).send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).send({
        error: error.message,
      });
    }
}) )

// app.post("/create-payment-intent", async (req, res) => {
//     const { amount } = req.body;
  
//     if (!amount) {
//       return res.status(400).json({ message: "Amount is required" });
//     }
  
//     try {
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount,
//         currency: "usd",
//         payment_method_types: ["card"],
//       });
  
//       res.status(200).send({
//         clientSecret: paymentIntent.client_secret,
//       });
//     } catch (error) {
//       console.error("Error creating payment intent:", error);
//       res.status(500).send({
//         error: error.message,
//       });
//     }
//   });
  export default router;