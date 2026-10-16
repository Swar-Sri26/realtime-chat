import  React,{useState,useEffect,createContext } from "react";
import axios from 'axios'
import toast from 'react-hot-toast'
import io from 'socket.io-client'

export const AuthContext=createContext();
const backendUrl=import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
export const AuthProvider=({children})=>{
    const[token,setToken]=useState(localStorage.getItem("token"));
    const [authUser,setAuthUser]=useState(null)
    const [onlineUsers,setOnlineUsers]=useState([])
    const [socket,setSocket]=useState(null)
//to check if user is authenticated and set user data and socket connection
    const checkAuth= async()=>{
        try{
            const {data}=await axios.get("/api/auth/check");
            
            console.log("LOGIN API RESPONSE:", data);

            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        }catch(error){
            console.log(error)
            toast.error(error.message)
        }
    }
    
    //login function to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
        console.log("LOGIN STATE:", state);
        console.log("LOGIN CREDENTIALS:", credentials);
        const { data } = await axios.post(`/api/auth/${state}`, credentials);
        console.log ("LOGIN API RESPONSE:", data);

        if (data.success) {
            setAuthUser(data.userData);
            connectSocket(data.userData);

            axios.defaults.headers.common["token"] = data.token;
            setToken(data.token);
            localStorage.setItem("token", data.token);

            toast.success(data.message);

          // 🔥 THIS IS THE KEY
        } else {
            toast.error(data.message);
            
        }
    } catch (error) {
        toast.error(error.message);
        
    }
};
    //logout function to user logout ans socket disconnection
    const logout=async()=>{
        localStorage.removeItem("token"); 
            setToken(null);
            setAuthUser(null);
            setOnlineUsers([]);
            axios.defaults.headers.common["token"]=null;
            toast.success("logged out successfully")
            socket?.disconnect()
    }
    //update profile function to handle user profilr updates

    const updateProfile=async(body)=>{
        try{
            const {data}=await axios.put("/api/auth/update-profile",body);
            if(data.success){
                setAuthUser(data.user);
            toast.success("profile updated successfully")
        }
    }
        catch(error){
            toast.error(error.message)
        }
    }
    //conect socket function to handle socket connection and online users updates
    const connectSocket=(userData)=>{
        if(!userData || socket?.connected)return;
        const newSocket=io(backendUrl,{

            query:{
                userId:userData._id,
            }
    })
        newSocket.connect();
        setSocket(newSocket)
        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds);
        })
    }
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"]=token;
        }
        checkAuth()
    },[])
    const value={
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}