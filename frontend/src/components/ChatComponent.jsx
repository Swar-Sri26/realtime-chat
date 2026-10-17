import React, { useEffect, useRef, useContext, useState } from "react";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { formatTime } from "../lib/utils";
import { ChatContext } from "../../context/chatContext";
import { AuthContext } from "../../context/AuthContext";

function ChatComponent({ onProfileClick }) {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    selectedGroup,
    setSelectedGroup,
    getGroupMessages,
    sendGroupMessage,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);
  const scrollEnd = useRef(null);
  const [input, setInput] = useState("");

  const isGroup = !!selectedGroup;
  const chatOpen = selectedUser || selectedGroup;

  // one send function for both chat types
  const send = (body) =>
    isGroup ? sendGroupMessage(body) : sendMessage(body);

  // group messages have senderId populated as an object, direct ones as a string
  const getSenderId = (message) => message.senderId?._id || message.senderId;

  const closeChat = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await send({ text: input.trim() });
    setInput("");
  };

  // Handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }
    const reader = new FileReader();

    reader.onload = async () => {
      await send({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
    }
  }, [selectedUser, selectedGroup]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return chatOpen ? (
    <div className="w-full overflow-scroll h-full flex flex-col justify-between relative backdrop-blur-lg">
      {/* .....header..... */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        {isGroup ? (
          selectedGroup.groupPic ? (
            <img
              src={selectedGroup.groupPic}
              alt="group"
              className="w-8 rounded-full cursor-pointer"
              onClick={onProfileClick}
            />
          ) : (
            <div
              onClick={onProfileClick}
              className="w-8 aspect-square rounded-full bg-violet-500/50 flex items-center justify-center text-sm text-white cursor-pointer"
            >
              {selectedGroup.name.charAt(0).toUpperCase()}
            </div>
          )
        ) : (
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            alt="profile"
            className="w-8 rounded-full cursor-pointer"
            onClick={onProfileClick}
          />
        )}

        <div className="flex-1 flex flex-col leading-4">
          <p className="text-sm text-white flex items-center gap-2">
            {isGroup ? selectedGroup.name : selectedUser.fullName}
            {!isGroup && onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </p>
          {isGroup && (
            <span className="text-xs text-gray-400">
              {selectedGroup.members?.length} members
            </span>
          )}
        </div>

        <img
          onClick={closeChat}
          src={assets.arrow_icon}
          alt=""
          className="cursor-pointer"
        />
        <img src={assets.help_icon} alt="" className="w-5 max-md:hidden" />
      </div>

      {/* .....chat body..... */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((message, index) => {
          const senderId = getSenderId(message);
          const isMine = senderId === authUser._id;

          // avatar: me, the group member who sent it, or the direct-chat user
          const avatar = isMine
            ? authUser?.profilePic || assets.avatar_icon
            : isGroup
            ? message.senderId?.profilePic || assets.avatar_icon
            : selectedUser?.profilePic || assets.avatar_icon;

          return (
            <div
              key={message._id || index}
              className={`flex flex-col gap-2 mb-3 ${
                !isMine && "flex-row-reverse"
              }`}
            >
              {message.image ? (
                <img
                  src={message.image}
                  alt=""
                  className="max-w-57.5 border border-gray-700 rounded-lg overflow-hidden mb-8"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                    isMine ? "rounded-br-none" : "rounded-bl-none"
                  }`}
                >
                  {message.text}
                </p>
              )}
              <div className="text-center text-xs">
                <img src={avatar} alt="" className="w-4 rounded-full" />
                {isGroup && !isMine && (
                  <p className="text-violet-300 max-w-16 truncate">
                    {message.senderId?.fullName}
                  </p>
                )}
                <p className="text-gray-500">{formatTime(message.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/*.............bottom Area..............*/}
      <div className="flex items-center gap-3 mx-4 py-2 border-t border-stone-500">
        <div className="flex-1 flex items-center bg-gray-100/50 rounded-full px-3 py-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            placeholder="Type your message here..."
            className="bg-transparent border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png,image/jpeg"
            hidden
          />
          <label htmlFor="image" className="cursor-pointer">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat Anywhere, anytime</p>
    </div>
  );
}

export default ChatComponent;