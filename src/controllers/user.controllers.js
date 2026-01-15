import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId) 

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        //accessToken is given to user but refreshToken is saved to db as we dont want to ask for pass often
        
        user.refreshToken = refreshToken //added val of this token in user obj
        await user.save({validateBeforeSave: false}) //dont apply any validations rn & just save it

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh & access tokens")
    }
}

//registers the user 
const registerUser = asyncHandler(async (req, res) => {
    //steps to register a user:
    //get details of user from frontend ( from req.body or url )
    //validation (ex: not empty)
    //check if user already exist (check wrt username & email both or any 1 )
    //check for images , check for avatar
    //upload them to cloudinary, avatar
    //create user obj - create entry in db 
    //remove pass & refresh token field from response
    //check for user creation
    //return response

    const { fullname, email, username, password } = req.body; //helps getting details from user
    //console.log("email: ", email);

    if( //if any of this is empty it returns true, (this can also be done by individual if else)
        [fullname,email,username,password].some( (field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username} , {email}]  //$or is used to check more than 1 value, returns bool
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path; //given by multer, [0] is 1st property
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(404, "avatar files is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(404, "avatar files is required")
    }

    const user = await User.create({
        fullname,
        //for avatar we check path & validation both but not for coverImage
        //& so we check if url exists in coverImage return it or give " "
        avatar: avatar.url, //we'll store only url not whole avatar in db
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        //here we write the ones we dont want or wanna remove, & so we use '-' before 
        "-password -refreshToken" 
    )
    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser , "User registered successfully" )
    )
})

const loginUser = asyncHandler(async (req,res) => {
    //steps:
    //get data from req body
    //username or email
    //find user
    //pass check
    //generate access token & refresh token
    //send cookies 
    
    const {email, username, password} = req.body
    if( !(username || email) ){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username} , {email}]  //to check both betn username & email we use $or (mongoose operator)
    })
    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    //'User' is obj of mongoose so use it for mongodb work like findOne etc
    //but methods like isPasswordCorrect \ generateToken is made by us so we use 'user' here
    const isPasswordValid  = await user.isPasswordCorrect(password) //pass used here came from req.body
    if(!isPasswordValid){
        throw new ApiError(401, "Password incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //we took user obj at top & method is called right above this line so we have ref of 'user' which is empty
    //we have 2 ways- 1) either update the obj or 2) give one more db query
    //but for 2) think if its an expensive operation , if yes then go with 1) 
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //for sending cookies we design options which is just an obj
    const options = {
        //this helps to prevent modifying cookies by default in frontend
        //i.e it can modified from server only if we apply this 2 options
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken, options)
    .cookie("refreshToken" , refreshToken, options)
    .json(
        new ApiResponse(
            200,
            { //this step is optional to handle the case when user is trying to save both tokens manually
                user:loggedInUser, accessToken, refreshToken 
            },
            "User loggedIn successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { //this mongodb operator helps to update given fields below
            $set: {
                refreshToken: undefined
            }
        },
        { //return response value will be new updated valu e
            new: true
        }
    )

     const options = {
        //this helps to prevent modifying cookies by default in frontend
        //i.e it can modified from server only if we apply this 2 options
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200, {} , "user logged out"))
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    //access refreshToken from cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "invalid refresh token")
        }
        
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "refresh token is expired or used")
        }
    
        //now after all checks we return new tokens from generateAccessAndRefreshTokens
        const options = {
            httpOnly: true,
            secure:true
        }
    
        const {accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken" , accessToken, options)
        .cookie("refreshToken" , newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, 
                    refreshToken: newRefreshToken
                },
                "access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid request token")
    }
    
})

export { registerUser, loginUser, logoutUser, refreshAccessToken }