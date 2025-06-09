import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


// Middlewares setup
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

// Add the headers configuration here, right after CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(express.json({limit: '16kb'})); // Limit request body size to 16kb (allowing json requests)
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // Parse URL-encoded bodies
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cookieParser()); // Parse cookies from request headers


// routes import
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import publicRouter from "./routes/public.routes.js";

// routes decalaration
app.use("/api/v1/healthcheck", healthcheckRouter)

app.use("/api/v1/users", userRouter); 
// it will go to http://localhost:3000/api/v1/users/register

app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

app.use("/api/v1/public", publicRouter);


export default app;