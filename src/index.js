// require("dotenv").config({path: './env'});

// This is the entry point of the application
import dotenv from "dotenv";
import connectDB from "./db/db_connect.js";

dotenv.config({
    path: "./env" 
});


connectDB()












/* First approach wrting the db connection code in the index.js (not recommended for production use)
import express from "express"
const app = express()
const port = process.env.PORT || 8000;
;( async () => {

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR", error)
            throw error
        })

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            
        })

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }

})() // immediately invoked function expression (IIFE)
 */