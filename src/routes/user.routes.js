import { Router } from "express";
import {loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


//just as we made 'app' with express, in same way me make a router now
const router = Router()
 
router.route("/register").post(
    upload.fields([
        //for avatar
        {
            name: "avatar",
            maxCount: 1
        },
        //for cover image 
        {
            name: "coverImage",
            maxCount: 1
        } 
    ]) ,
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser) //verifyJWT verifies if user is loggedIn 
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails) //patch updates only the fields you send
router.route("/avatar").patch(verifyJWT, upload.single("avatar") ,updateUserAvatar) //single is used as one file is updated only
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage") ,updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile) // ' /c/: ' diff path is written due to params
router.route("/history").get(verifyJWT, getWatchHistory)

export default router