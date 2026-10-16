import Message from'../models/message.js'
import User from '../models/User.js';
import cloudinary from '../models/cloudinary.js';
import {io,userSocketMap} from '../server.js';


//get all useres for sidebar except the logged in user
export const getUsersForSidebar=async(req,res)=>{
    try{
        const userId=req.user._id;
        const filteredUsers=await User.find({_id:{$ne: userId}}).select("-password");
        //Count number of messages not seen
        const unseenMessages= {}
        const promises=filteredUsers.map(async(user)=>{
          const messages=await Message.find({senderId:user._id,receiverId:userId,seen:false})
          if(messages.length>0){
            unseenMessages[user._id]=messages.length;

          }
        })
        await Promise.all(promises)//makes your code wait until all the database queries inside map() are finished.
        res.json({ success: true, users: filteredUsers, unseenMessages });
    }
    catch(error){
      console.log(error.message);
      res.json({ success: false, message:error.message });
    }
};
//get all messages for selected users

export const getAllMessages = async (req, res) => {
  try {
    const { id:selectedUserId } = req.params;
    const myId=req.user._id;

    const messages = await Message.find({ 
      $or:[{ senderId: myId, receiverId: selectedUserId }, 
        { senderId: selectedUserId, receiverId: myId }]
    })
    await Message.updateMany({ senderId: selectedUserId, receiverId: myId, }, { seen: true });
    res.status(200).json({success:true, messages});
  } catch (error) {
    console.log(error.messsage);
    res.status(500).json({ success:false,message: error.message });
  }
};

//api to mark message as seen using message id
export const markMessagesAsSeen=async(req,res)=>{
  try{
    const {id}=req.params;
    await Message.findByIdAndUpdate(id,{seen:true});
    res.json({success:true,message:"Message marked as seen"});
  }
  catch(error){
    console.log(error.message);
    res.status(500).json({success:false,message:error.message});
  } 
}
//Send message to selected user
export const sendMessage=async (req,res)=>{
    try{
        const {text,image}=req.body;
        const receiverId=req.params.id;
        const senderId=req.user._id;
        
        let imageUrl;
        if(image){
          const uploadResponse=await cloudinary.uploader.upload(image);
          imageUrl = uploadResponse.secure_url;
        }
        const newMessage=await Message.create({
          senderId,
          receiverId,
          text,
          image:imageUrl
      })
       const receiverSocketId=userSocketMap[receiverId] ;
       if(receiverSocketId){
        io.to(receiverSocketId).emit("newMessage",newMessage)
       }
      res.json({success:true,message:"Message sent successfully",newMessage});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({success:false, message: "Server error" });
  }
};