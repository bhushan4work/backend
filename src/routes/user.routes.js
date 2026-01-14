import { Router } from "express";
import {registerUser} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"

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

export default router