import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username:{
            type: String,
            lowercase: true,
            required: true,
            unique: true,
            trim: true,
            index: true //used to make it searchable in DB, makes it  more optimal
        },
         email:{
            type: String,
            lowercase: true,
            required: true,
            unique: true,
            trim: true
        },
        fullname:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar:{ 
            type: String, //we'll use cloudinary url 
            required: true,
        },
        coverImage:{
            type:  String  //we'll use cloudinary url 
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{ 
            type: String,
            required: [true, 'password is required'] //custom error msg is added
        },
        refreshToken:{ 
            type: String, 
        },

    },
    {
        timestamps: true
    }
)

//dont use arrow fxn for callback of 'pre middlewear'as it doesnt have ref of 'this' keyword
//& for middlewear we'll need context from user ,also this process req lot of time so async is used
userSchema.pre("save" , async  function (next){ //next is a flag & is called after job is done
    //as we dont want pass to change each time we save info, we add a if condition
    if(!this.isModified("password")) return next() ;
     
    this.password = await bcrypt.hash(this.password, 10)  //'10' tells bcrypt how many times to run hashing algo internally
    next()
})

//make custom methods
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)  //as lot of time req we add 'await '
}

//async not needed here as these fxn works fast
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
       },
       proces.env.ACCESS_TOKEN_SECRET,
       {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
       }
    )
}
userSchema.methods.generateRefreshToken = function(){
     return jwt.sign(
        {
            _id: this._id //as refreshToken refreshes often so we keep  only id here
        },
       proces.env.REFRESH_TOKEN_SECRET   ,
       {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
       }
    )
}

export const User = mongoose.model("User" , userSchema)