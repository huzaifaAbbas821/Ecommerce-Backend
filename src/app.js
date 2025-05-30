import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import { env } from 'node:process';
import dotenv from "dotenv"; // <-- important!

// Load environment variables
dotenv.config(); // <-- Load .env variables
const  app = express();

app.use(cookieParser());

app.use(cors({
    origin: "https://ecommerce-coral-two.vercel.app",
    credentials: true
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit: "16kb"}))
app.use(express.static("public"));

//routes import 
import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"
import paymentRouter from "./routes/payment.routes.js"


//routes decalaration
app.use("/api/users",userRouter);
app.use("/api/products",productRouter);
app.use("/payment",paymentRouter)


export {app}
