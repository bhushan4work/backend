import express from "express";
import cors from "cors";
//work is to access the cookies from user's browser\set it & do crud operations
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true 
}))

//we set limit we want to accept ,& if we do not do this then the app may crash
app.use(express.json({limit: "16kb"}))
//url is encoded into long stings so to manage that we do .urlencoded
app.use(express.urlencoded({extended: true , limit: "16kb"})) //things inside obj are options(not compulsion to add)
app.use(express.static("public"))
app.use(cookieParser()) 


export { app };
