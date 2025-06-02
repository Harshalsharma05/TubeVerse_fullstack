import { Router } from "express";
import { changeCurrentPassword, 
        getCurrentUser, 
        getUserChannelProfile, 
        getWatchHistory, 
        loginUser, 
        logoutUser, 
        refreshAccessToken, 
        registerUser, 
        updateAccountDetails, 
        updateUserAvatar, 
        updateUserCoverImage 
    } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

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

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)

export default router