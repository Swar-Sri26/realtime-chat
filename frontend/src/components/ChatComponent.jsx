import React,{useEffect, useRef,useContext,useState} from 'react' 
import toast from 'react-hot-toast'
import assets from '../assets/assets' 
import { formatTime } from '../lib/utils'
import { ChatContext } from '../../context/chatContext'
import { AuthContext } from '../../context/AuthContext'
function ChatComponent({onProfileClick}) { 
  const{messages,selectedUser,setSelectedUser,sendMessage ,getMessages,}=useContext(ChatContext)

  const {authUser , onlineUsers}=useContext(AuthContext)
  const scrollEnd = useRef(null)
  const[input,setInput]=useState('');

  const handleSendMessage=async(e)=>{
    e.preventDefault();
    if(input.trim() === "")return null;
    await sendMessage({text:input.trim()});
    e.target.value=""
    setInput("")
  }

  //Handle sending as image
  const handleSendImage= async(e)=>{
    const file=e.target.files[0];
    if(!file || !file.type.startsWith("image/")){
      toast.error("Select an image file")
      return;
    }
    const reader = new FileReader();

    reader.onload= async()=>{
      await sendMessage({image: reader.result})
      e.target.value=""
    }
    reader.readAsDataURL(file);
  }

  useEffect(()=>{
    if(selectedUser){
      getMessages(selectedUser._id)
    }
  },[selectedUser])

  useEffect(() => { 
    if(scrollEnd.current && messages){
    scrollEnd.current.scrollIntoView({behavior:'smooth'}) 
  }
}, [messages]) 


  return selectedUser? ( 
  <div className='w-full overflow-scroll h-full flex flex-col justify-between relative backdrop-blur-lg'> 

                                          {/* .....header..... */} 
  <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'> 
    <img src={selectedUser.profilePic || assets.avatar_icon} alt="profile" className='w-8 rounded-full' onClick={onProfileClick}/>
     <p className='flex-1 text-sm text-white flex items-center gap-2'> 
      {selectedUser.fullName} 
      {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
       </p> 
       <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} 
       alt=""/>
        <img src={assets.help_icon} alt="" className='w-5 max-md:hidden' />
         </div>
          {/* .....chat body..... */}
          <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
             {messages.map((message, index) => ( 
              <div key={index} className={`flex flex-col gap-2 mb-3 
                  ${message.senderId !== authUser._id && 'flex-row-reverse'}`}>
                   {message.image ? ( 
                    <img src={message.image} alt="" className='max-w-57.5 border border-gray-700 rounded-lg overflow-hidden mb-8'/>
                   ):
                   ( <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 
                    break-all bg-violet-500/30 text-white ${message.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                      {message.text}</p> 
                      )} 
                      <div className='text-center text-xs'> 
                        <img src={message.senderId === authUser._id ? authUser?.profilePic ||assets.avatar_icon : selectedUser?.profilePic ||
                          assets.avatar_icon}
                         alt="" className='w-4 rounded-full'/> 
                         <p className='text-gray-500'>
                          {formatTime(message.createdAt)}
                          </p> 
                          </div> 
                        </div> 
                      ))}
                   <div ref={scrollEnd}></div>
              </div> 
               {/*.............bottom Area..............*/}
               <div className='flex items-center gap-3 mx-4 py-2 border-t border-stone-500'>
                <div className='flex-1 flex items-center bg-gray-100/50 rounded-full px-3 py-1'>
                  <input onChange={(e)=>setInput(e.target.value)} type="text"onKeyDown={(e)=>e.key==="Enter" ? handleSendMessage(e):null} placeholder='Type your message here...' className=
                  'bg-transparent border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none'/>
                  <input onChange={handleSendImage} type="file" id='image' accept='image/png,image/jpeg' hidden/>
                  <label htmlFor='image' className='cursor-pointer'>
                    <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
                    </label>
                </div>
                <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer'/>
                </div>
              </div>
              ): ( 
              <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'> 
              <img src={assets.logo_icon} alt="" className='max-w-16'/> 
              <p className='text-lg font-medium text-white'>
                Chat Anywhere,anytime</p> 
                </div> 
                )
          }
          export default ChatComponent