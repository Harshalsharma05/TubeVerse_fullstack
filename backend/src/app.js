import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


// Middlewares setup
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: '16kb'})); // Limit request body size to 16kb (allowing json requests)
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // Parse URL-encoded bodies
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cookieParser()); // Parse cookies from request headers


// routes import
import userRouter from "./routes/user.routes.js";

// routes decalaration
app.use("/api/v1/users", userRouter); // it will go to http://localhost:3000/api/v1/users/register




export default app;