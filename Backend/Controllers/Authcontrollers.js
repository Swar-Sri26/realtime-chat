import Usermodel from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import cloudinary from '../models/cloudinary.js';
import {generateToken} from '../utils.js';
export const signup = async (req, res) => {
    try {
        const {fullName,email,password,bio} = req.body;

        console.log(req.body);

        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({ success:false, message: "fill all the parameters" });
        }

        const user = await Usermodel.findOne({ email });
        console.log("USER FOUND:",user)
        if (user) {
            return res.status(401).json({
            success: false,
            message: 'User already registered'
          });
        }                                                 

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password:", hashedPassword);
        const newUser = await Usermodel.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });
        const token =generateToken(newUser._id)
        res.json({success:true,userData:newUser,token,message:"`User successfully registered`"})
    } catch (err) {
        console.error("Error during signup:", err);
        return res.status(500).json({ sucess: false, 
            message: "Server Error"
        });
    }
};

export const login=async(req,res)=>{
        try{
            const{email,password}=req.body;
            if(!email || !password){
                return res.status(401).json({
                    message:"All parameters must be filled"
                });
            }
             const user=await Usermodel.findOne({email});
             if(!user){
                return res.status(401).json({
                    message:"User does not exist"
                });
             }
            const isPassword=await bcrypt.compare(password,user.password);
            if(!isPassword){
                return res.status(401).json({
                    message:"Wrong email or password"
                });
            }
            const token=generateToken(user._id);
                res.json({
                    success:true,
                    userData:user,
                    id:user._id,
                    message:"Login Succesfull",
                    token,});
                console.log("LOGIN RESPONSE:", {
  _id: user._id,
  name: user.name,
  email: user.email
});
    }
        catch(error){
            return res.status(400).json({
                message:"Server error",
                error
            });     
        
        }
    }
    //controller to check whther user is authenticated or not
    export const checkAuth=(req,res)=>{
    res.json({success:true,user:req.user}) //returns user data if authenticated, otherwise returns 401 error from auth middleware
}

          //Cotroller to update user profile
    export const updateProfile=async(req,res)=>{
        try{
            const {profilePic ,bio,fullName}=req.body;
            const userId=req.user.id;
            let updatedUser;
            if(!profilePic){
                updatedUser=await Usermodel.findByIdAndUpdate(userId,{
                    bio,
                    fullName
                },{new:true});
                 
            }
            else{
                const upload=await cloudinary.uploader.upload(profilePic) 
                updatedUser=await Usermodel.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true})
            }
            res.json({success:true,user:updatedUser,message:"Profile updated successfully"})
            }
            catch(error){
                console.log(error.message);
                res.status(500).json({success:false,message:"Server error"})

            }
        }
                 