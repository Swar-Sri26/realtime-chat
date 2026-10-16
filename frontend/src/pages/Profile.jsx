import React,{useState,useContext} from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import assets from '../assets/assets';
const Profile=()=> {
  const navigate = useNavigate()

  const{authUser,updateProfile}=useContext(AuthContext)

  const [selectImage,setSelectImage]=useState(null);
  const [name,setName]=useState(authUser?.fullName || "")
  const [bio,setBio]=useState(authUser?.bio || "")

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!selectImage){
      await updateProfile({fullName:name,bio})
      navigate('/')
      return;
    }
    const reader=new FileReader();
    reader.readAsDataURL(selectImage)
    reader.onload = async()=>{
      const base64Image=reader.result;
      await updateProfile({profilePic:base64Image,
        fullName:name,
        bio})
      navigate('/')
    }
  }
  return (
      <div className='min-h-screen bg-cover bg-center flex items-center justify-center'>
        <div className='relative w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
  {/* your content */}
          <form  onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
            <h3 className="text-lg">Profile details</h3>
            <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
              <input onChange={(e)=>setSelectImage(e.target.files[0])} type='file' id='avatar' accept='.png,.jpg,.jpeg' hidden
               className='flex items-center gap-3 cursor-pointer'/>
              <img src={selectImage? URL.createObjectURL(selectImage):assets.avatar_icon} alt="" 
              className={`w-12 h-12 ${selectImage && 'rounded-full'}`}/>
              upload profile image
              </label>
          <input onChange={(e)=>setName(e.target.value)} value={name}
          type="text" required placeholder='Enter youe name' className='p-2 border border-gray-500 riunded-md focus:outline-none focus:ring-2 focus:ring-voilet-500'/>
          <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Enter your bio' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-voilet-500 rows={4}'>
            </textarea>
            <button type="submit" className="bg-gradient-to-r from-purple-400
            to-voilet-600 text-white p-2 rounded-fulltext-lg curson-pointer">Save
            </button>
          </form>
          <img src={assets.logo_icon} alt="" className='w-1/2 max-sm:w-full rounded-r-lg max-sm:rounded-t-lg'/>
        </div>
      </div>
    
  )
}

export default Profile;