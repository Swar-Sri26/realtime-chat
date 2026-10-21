import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../context/chatContext";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatComponent";
import RightSidebar from "../components/RightSidebar";

const Home = () => {
  const { selectedUser, selectedGroup } = useContext(ChatContext);
  const chatOpen = selectedUser || selectedGroup;
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  // hide the right panel again when the chat changes or closes
  useEffect(() => {
    setShowRightSidebar(false);
  }, [selectedUser?._id, selectedGroup?._id]);

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid grid-cols-1 relative ${
          chatOpen && showRightSidebar
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : chatOpen
            ? "md:grid-cols-[1fr_2fr]"
            : "md:grid-cols-2"
        }`}
      >
        <Sidebar />
        <ChatContainer
          onProfileClick={() => setShowRightSidebar((prev) => !prev)}
        />
        {chatOpen && showRightSidebar && (
          <RightSidebar onClose={() => setShowRightSidebar(false)} />
        )}
      </div>
    </div>
  );
};

export default Home;