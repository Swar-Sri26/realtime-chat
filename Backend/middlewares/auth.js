import Usermodel from '../models/User.js'
import jwt from 'jsonwebtoken'; 
export const protectRoute=async(req,res,next)=>{
    try{
        const token=req.headers.token;

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user =await Usermodel.findById(decoded.id).select("-password");//remove password from the user data
        if(!user){
          return res.json({success:false,message:"User not found"});
        }
        req.user=user;
        next();
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:"User not found"});
    }
}

