// require('dotenv').config({path: './env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
});

connectDB() // when asynchronousMethod i.e connectDB completes , it returns a promise & so we do this
    .then(() => {
        app.on("error", (error) => { //listening for errors on app 
            console.log("ERROR", error);
            throw error;
        })
        app.listen(process.env.PORT || 8000, () => { //means if process.env.PORT doesnt work we can go with PORT:8000
            console.log(`server is running at port: ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log(" mongo db connection failed !!!", err);
    })




/*
import mongoose from "mongoose";
import {DB_NAME} from "../constants";

import express from 'express';
const app = express();

( async () => {
    try {
        await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) ;
        app.on("error" , (error) => {
            console.log("ERROR" , error);
            throw error;
        })
        
        app.listen(process.env.PORT , () => {
            console.log(`app is listening on port ${process.env.PORT}`);
        })
        
    } catch (error) {
        console.log("ERROR" , error);
        throw error;
    }
})()
*/
