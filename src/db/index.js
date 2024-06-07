import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// always use a try catch block when connecting to a database
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); // .connect is the method that we use to connect to the database
        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);//the connection stored in the connectionInstance variable have the reference to the connection object where we get access to the host property
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // 1 is a failure code
    }
}

export default connectDB //exporting the function so we can use it in other files