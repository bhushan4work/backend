import { Router } from "express";
import {loginUser, registerUser, logoutUser, refreshAccessToken} from "../controllers/user.controllers.js";
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
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)


export default router