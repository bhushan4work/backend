import { Router } from "express";
import {registerUser} from "../controllers/user.controllers.js";

//just as we made 'app' with express, in same way me make a router now
const router = Router()

router.route("/register").post(registerUser)

export default router