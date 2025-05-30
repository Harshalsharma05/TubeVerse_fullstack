import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "..middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([ // middleware to handle multiple file uploads
        {
            name: "avatar", // should be same as the name in the form data (frontend)
            maxCount: 1 // max 1 file for avatar
        },
        {
            name: "coverImage", // should be same as the name in the form data (frontend)
            maxCount: 1 // max 1 file for cover image
        }
    ]),
    registerUser // registerUser is the controller function that handles the registration logic
)

router.route("/login").post(loginUser)

// secure routes
router.route("/logout").post(verifyJWT, logoutUser)

export default router