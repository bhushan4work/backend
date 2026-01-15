//this middleware will just verify if user is there or not

import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/asyncHandler"
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"


//there can be places where any one of the 3 req\res\next is not in use
//so in such condition we put a '_' in place of res here in our example
export const verifyJWT = asyncHandler(async(req, res, next ) => {
   try {
     //req has access of cookies, how ? as we used 'app.use(cookieParser())' & gave access
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "")
     if(!token){
         throw new ApiError(401, "unauthorized request")
     }
     //after verification we'll get decoded info
     const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
     if(!user){
         throw new ApiError(401, "invalid access token")
     }
 
     req.user = user
     next() //gives signal to run the next fxn further after prev work is done
   } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token")
   }
})