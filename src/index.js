// require('dotenv').config({path: './env'})
// this is the old version and this makes the code inconsistent, so we use import instead
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({path: './env'})

connectDB();


















// import express from "express";

// const app = express();

// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on('error', (error) => {
//             console.error('Error starting server', error);
//             throw error;
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`Server started on http://localhost:${process.env.PORT}`);
//         })
//         console.log('Connected to MongoDB');
//     } catch (error) {
//         console.error('Error connecting to MongoDB', error);
//         throw error;
//     }
// }) ()