import React,{useContext} from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets.js';
import { AuthContext } from '../../context/AuthContext.jsx';
const login=()=> {
  
    const navigate=useNavigate();

    const [currState,setCurrState]=useState("signup");
    const [fullName,setFullName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const[bio,setBio]=useState("");
    const[isDataSubmitted,setIsDataSubmitted]=useState(false);
    
    const {login} = useContext(AuthContext);


    const onSubmitHandler=async (e)=>{
        e.preventDefault();
        console.log("submit working");
        if(currState==="signup" && !isDataSubmitted){
            setIsDataSubmitted(true)
            return;
         }
        login(currState==="signup"?'signup':'login',{fullName,email,password,bio})
    }
    
  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center 
        gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
                <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]'/>           


        <form onSubmit={onSubmitHandler} className='border-2 bg-white/10 text-black border-gray-500
         
         p-6 flex flex-col text-white gap-6 rounded-lg shadow-lg'>
                <h2 className='font-medium text-2xl text-white flex justify-between items-center'>
                    {currState}
                    {isDataSubmitted &&(
                    <img onClick={()=> setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer'/>)}
                </h2>
                {currState === "signup" &&  !isDataSubmitted && (
                    <input onChange={(e) => setFullName(e.target.value)} type="text" placeholder='Enter your Full name' 
                    className='mb-4 p-2 border  border-gray-500 rounded-md focus:outline-none' required/>
                )}
                {!isDataSubmitted && (
                    <>
                                <input onChange={(e)=>setEmail(e.target.value)}
                                value={email}
                               type='email'
                               name='email'
                               autoFocus
                               placeholder=' Enter your email'
                               required
                               className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2
                                focus:ring-indigo-500'/>
                               <input onChange={(e)=>setPassword(e.target.value)}
                               value={password}
                               type='password'
                               name='password'
                               required
                               placeholder=' Enter your password'
                               className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2
                                focus:ring-indigo-500'/>

                    </>
                )}
                {currState ==="signup" && isDataSubmitted && (
                    <textarea onChange={(e)=>setBio(e.target.value)} 
                    value={bio}
                    rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none 
                    focus:ring-2 focus:ring-indigo-500'
                    placeholder='Enter your bio... ' required></textarea> 
                )
        }
            <button type='submit' className='py-3 from-purple-400
            to-violet-600 text-white rounded-md cursor-pointer'>
                {currState === "signup"? "Create Account" : "login Now"}
                </button>
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <input type="checkbox" required/>
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>
                <div className='flex flex-col gap-2'>
                {currState === "signup" ? (
                    <p className='text-sm text-gray-600'>Already have an account? <span onClick={()=>
                        {setCurrState("login"); setIsDataSubmitted(false)}}
                    className='font-medium text-violet-500 cursor-pointer'>login here</span></p>):(
                        <p className='text-sm text-gray-600'>Create a account <span 
                        onClick={()=>{setCurrState("signup")}} className='font-medium
                         text-violet-500 cursor-pointer'>click Here</span></p>
                    )}
                    </div>
            </form>
        </div>
        
  )
}
export default login;