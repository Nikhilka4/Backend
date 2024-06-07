import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// in this file we will create and setup the app
const app = express();

app.use(cors({ // this is the method to enable cors, that is which port is allowed to access the data
    origin: process.env.CORS_ORIGIN, // port location
    credentials: true // details of the user
}));

app.use(express.json({limit: '16kb'})); // to parse the incoming json data which has a limit of 16kb
app.use(express.urlencoded({extended: true, limit: '16kb'})); // to parse the incoming urlencoded data which has a limit of 16kb, generally used for form data and url data
app.use(express.static('public'));// to serve static files
app.use(cookieParser()); // to parse the incoming cookie data


export { app } // we are exporting the app so that we can use it in other files