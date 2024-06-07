// require('dotenv').config({path: './env'})
// this is the old version and this makes the code inconsistent, so we use import instead
import dotenv from "dotenv"; // this is the new version, we use to maintain the consistency of the code
// but we need to add a line in the script we are running to make it work
// -r dotenv/config --experimental-json-modules in between the nodemon and the file name
import connectDB from "./db/index.js"; // import the connectDB function from the db/index.js file
import { app } from "./app.js"; // import the app object from the app.js file

dotenv.config({path: './.env'}) // after using the import statement, we need to config the dotenv package. and we have to specify the path of the .env file

connectDB() // this line runs the connectDB function and this is a form of promise so we can use ".then" function after this function
.then(() => {
    //Generally, these below lines are used to handle the errors in app communicating with the database
    // app.on('error', (error) => {
    //     console.error('Error starting server', error);
    //     throw error;
    // })

    //this is the code to make the app listen to the port
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server started on http://localhost:${process.env.PORT}`);
    })
})
.catch((error) => {// this is the catch block to handle the errors in the connectDB function
    console.error('Error connecting to MongoDB', error);
    // throw error;
})


















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