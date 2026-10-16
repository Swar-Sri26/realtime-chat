import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
const mongo_url=process.env.MONGODB_URI;
mongoose.connect(mongo_url)
.then(()=>{
    console.log("MongoDB connected..")
}).catch((err)=>{
    console.log("MongoDB error connection:",err)
})
