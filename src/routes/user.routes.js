import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"

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
    registerUser
)

export default router