import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

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

export { registerUser }