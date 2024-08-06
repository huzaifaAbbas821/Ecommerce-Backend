// require('dotenv').config({path: './env'})
import "dotenv/config.js";

import connectDB from "./db/index.js";
import { app } from "./app.js";


connectDB()
.then( ()=>  app.listen(process.env.PORT || 3001, () => {
    console.log(`Server is running on Port : ${process.env.PORT}`);
}));