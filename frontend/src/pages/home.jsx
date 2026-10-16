import React, { useContext,useEffect,useState} from "react";
import { ChatContext } from "../../context/chatContext";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatComponent";
import RightSidebar from "../components/RightSidebar";                                      
const Home=()=>{

  const{selectedUser}= useContext(ChatContext)
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  useEffect(()=>{
    setShowRightSidebar(false);
  },[selectedUser])
  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid grid-cols-1 relative ${
          selectedUser && showRightSidebar
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : selectedUser
            ? "md:grid-cols-[1fr_2fr]"
            : "md:grid-cols-2"//whenever user is not selected the right sidebar 
            // will be hidden and the chat container will take up more space
        }`}
        >
        <Sidebar />
        <ChatContainer onProfileClick={() => setShowRightSidebar((prev) => !prev)} />
        {showRightSidebar && (
          <RightSidebar onClose={() => setShowRightSidebar(false)} />
        )}
      </div>
    </div>
  )
};

export default Home;