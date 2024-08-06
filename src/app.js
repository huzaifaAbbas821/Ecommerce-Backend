import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import { env } from 'node:process';
const  app = express();

app.use(cookieParser());
app.use(cors({
    origin:process.env.CORS_ORIGIN,
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
