// require("dotenv").config({path: './env'});

// This is the entry point of the application
import dotenv from "dotenv";
import connectDB from "./db/dbConnect.js";
import app from "./app.js"; 

dotenv.config({
    path: "./.env" 
});

const port = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.on("error", (error) => { // this app is gettig imported from app.js
        console.log("ERROR !!", error);
        throw error;
    }); // Handle error event

    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    }); // Start the server and listen on the specified port
})
.catch((err) => {
    console.error("MongoDB connection failed !!!", err)
});







// // another way of calling  connectDB by async await (more readable and understandable)
// const startServer = async () => {
//     try {
//         await connectDB();

//         app.on("error", (err) => {
//             console.error("App encountered an error !!", err);
//             throw err;
//         });

//         app.listen(port, () => {
//             console.log(`Server is running on port ${port}`);
//         })


//     } catch (error) {
//         console.error("MONGODB connection failed !!!", error)
//         process.exit(1)
//     }
// };
// startServer();


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