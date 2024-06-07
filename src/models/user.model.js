import mongoose, { Schema, model } from "mongoose"; // import mongoose, Schema, and model from mongoose framework (ORM -  Object Relational Mapper )
import jwt from "jsonwebtoken"; // jwt are the json web tokens which are used to authenticate the user, and maintain the security of the application
import bcrypt from "bcrypt"; // this is the bcrypt library which is used to hash the password 

const userSchema = new Schema( // create a new instance of Schema class named userSchema
    { // define the structure of the userSchema
        username: {
            // define the structure of the username field
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true // this line is used to create an index on the username field, which will improve the performance of the search query
        },
        email: {
            // define the structure of the email field
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            // define the structure of the fullName field
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            // define the structure of the avatar field, this is a image field so we use external services like cloudinary to store the image, to improve the performance of the application
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            // define the structure of the coverImage field, this is a image field so we use external services like cloudinary to store the image, to improve the performance of the application
             type: String, // cloudinary url
        },
        watchHistory: [
            // define the structure of the watchHistory field, this is a array field which will store the id of the videos which the user has watched
            {
                type: Schema.Types.ObjectId, // this is the way to refer the other schemas defined in the application
                ref: "Video" // this name should be same as the name of the model which is defined in the models folder
            }
        ],
        password: {
            // define the structure of the password field
            type: String,
            required: [true, "Password is required"], // here we are using the array notation to define the error message for the password field
            // minlength: [6, "Password must be at least 6 characters long"],
        },
        refreshToken: {
            // define the structure of the refreshToken field.
            // this is a array field which will store the refresh token of the user
            type: String,
        }
    },{timestamps: true})

userSchema.pre("save", async function (next) {
    // this is the pre middleware which is used to hash the password just before saving the user to the database

    //this is the regular way to hash the password, we use the if condition to check if the password is modified or not, if the password is modified then we hash the password, otherwise we skip the hashing process. 
    // The check is because we don't want to hash the password again if the password is not modified.
    // if (this.isModified("password")) {
    //     this.password = await bcrypt.hash(this.password, 10);
    // }
    // next();

    // negative check
    if(!this.isModified("password")) return next();//this is the negative check, if the password is not modified then we skip the hashing process.
    //otherwise, we hash the password.
    this.password = await bcrypt.hash(this.password, 10);// first we refer the password field and then we hash the password by using the bcrypt.hash function. The hash function takes the password and the salt as arguments and returns the hashed password.
    // here salt means the number of rounds which the bcrypt uses to hash the password.
    next(); // this is the line tell the middleware that the process is completed and it can move to the next middleware.
});

userSchema.methods.generateAccessToken = function () {
    // as before where we used .pre function to hash the password, we are using the .methods function to generate the access token for the user.
    // this is the common way of generating any methods we want to use in the model.
    // this is the method which is used to generate the access token for the user.
    return jwt.sign({ // jwt.sign function is used to generate the access token for the user.
        // here we are passing the payload which is the object which contains the id and the email of the user.
        // the access token contains more payload info then the refresh token.
        // as it expires quickly
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    }, process.env.ACCESS_TOKEN_SECRET, // we pass the secret key which is defined in the .env file.
    { 
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY // we pass the expiry time which is defined in the .env file.
    });
}

userSchema.methods.generateRefreshToken = function () {
    // this is the method which is used to generate the refresh token for the user. Same as the access token, we are using the jwt.sign function to generate the refresh token for the user.
    return jwt.sign({ 
        id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, { 
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
    });
}

userSchema.methods.isPasswordCorrect = async function (password) {
    // this is the method which is used to check if the password is correct or not.
    // this is the common way of checking the password.
    // this is always a async function because we are using the bcrypt.compare function which generally takes time
    return await bcrypt.compare(password, this.password);// we are using the bcrypt.compare function which takes two arguments, the first one is the password which the user is trying to enter and the second one is the hashed password which is stored in the database.
}

export const User = model("User", userSchema)// we are exporting the User model which is the instance of the mongoose.model function.