import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
   
const userSchema = new Schema(
{
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }

}, {timestamps: true})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next(); // if password is not modified, skip hashing
    // if password is modified, hash it
    
    // if (this.password.length < 6) {
    //     return next(new Error("Password must be at least 6 characters long"));
    // }
    
    this.password = await bcrypt.hash(this.password, 10)
    next()
}) // pre-save hook to hash password before saving into the database

userSchema.methods.isPasswordCorrect = async function (password) { // custom method to check password
    return await bcrypt.compare(password, this.password); // returns true or false (this.password is that which is in db)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign( // create a JWT token
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)


// NOTES:
// difference between access token and refresh token:
// 1. Access token is used to access protected resources, while refresh token is used to obtain a new access token when the current one expires.
// 2. Access token has a shorter lifespan (e.g., 15 minutes), while refresh token has a longer lifespan (e.g., 7 days).
// 3. Access token is sent with every request to access protected resources, while refresh token is sent only when the access token expires.
// 4. Access token is usually stored in memory or local storage, while refresh token is stored in a secure HTTP-only cookie.
// 5. Access token is signed with a secret key, while refresh token is signed with a different secret key.