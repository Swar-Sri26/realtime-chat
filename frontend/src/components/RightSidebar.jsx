import React, { useContext, useState, useEffect } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/chatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = ({ onClose }) => {
  const { selectedUser, selectedGroup, messages, users, addMembers, removeMember } =
    useContext(ChatContext);
  const { logout, onlineUsers, authUser } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  // close the picker when switching chats
  useEffect(() => {
    setShowAdd(false);
    setPicked([]);
  }, [selectedGroup?._id]);

  const chatOpen = selectedUser || selectedGroup;
  if (!chatOpen) return null;

  const everyone = [...users, authUser];
  const members = selectedGroup
    ? selectedGroup.members
        .map((id) => everyone.find((u) => u?._id === id))
        .filter(Boolean)
    : [];

  const isAdmin = selectedGroup && selectedGroup.admin === authUser._id;

  // users who are not in the group yet
  const addable = selectedGroup
    ? users.filter((u) => !selectedGroup.members.includes(u._id))
    : [];

  const togglePick = (id) =>
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAdd = async () => {
    if (picked.length === 0) return;
    const ok = await addMembers(selectedGroup._id, picked);
    if (ok) {
      setPicked([]);
      setShowAdd(false);
    }
  };

  const handleRemove = async (m) => {
    if (window.confirm(`Remove ${m.fullName} from the group?`)) {
      await removeMember(selectedGroup._id, m._id);
    }
  };

  return (
    <div
      className="bg-[#818582]/10 text-white w-full relative overflow-y-scroll
      max-md:absolute max-md:inset-0 max-md:z-20 max-md:bg-[#1c1c2e]"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-lg text-white cursor-pointer"
      >
        ✕
      </button>

      {selectedGroup ? (
        <>
          <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
            {selectedGroup.groupPic ? (
              <img
                src={selectedGroup.groupPic}
                alt=""
                className="w-16 aspect-square rounded-full"
              />
            ) : (
              <div className="w-16 aspect-square rounded-full bg-violet-500/50 flex items-center justify-center text-2xl">
                {selectedGroup.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="px-10 text-xl font-medium mx-auto">
              {selectedGroup.name}
            </h1>
            <p className="px-10 mx-auto">
              {selectedGroup.members.length} members
            </p>
          </div>

          <hr className="border-[#ffffff50] my-4" />

          <div className="px-5 text-xs">
            <div className="flex items-center justify-between">
              <p>Members</p>
              {isAdmin && (
                <button
                  onClick={() => setShowAdd((s) => !s)}
                  className="text-xs bg-violet-500/50 hover:bg-violet-500/70 px-2 py-1 rounded-full cursor-pointer"
                >
                  {showAdd ? "Cancel" : "+ Add"}
                </button>
              )}
            </div>

            {showAdd && (
              <div className="mt-2 p-2 rounded-md bg-black/20">
                {addable.length === 0 ? (
                  <p className="text-gray-400 py-1">
                    Everyone is already in this group
                  </p>
                ) : (
                  <>
                    <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                      {addable.map((u) => (
                        <label
                          key={u._id}
                          className="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-white/10"
                        >
                          <input
                            type="checkbox"
                            checked={picked.includes(u._id)}
                            onChange={() => togglePick(u._id)}
                          />
                          <img
                            src={u.profilePic || assets.avatar_icon}
                            alt=""
                            className="w-6 aspect-square rounded-full"
                          />
                          <span className="text-sm">{u.fullName}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={handleAdd}
                      className="mt-2 w-full text-sm py-1.5 rounded-full bg-violet-500 cursor-pointer"
                    >
                      Add selected ({picked.length})
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="mt-2 flex flex-col gap-2">
              {members.map((m) => (
                <div key={m._id} className="flex items-center gap-2">
                  <img
                    src={m.profilePic || assets.avatar_icon}
                    alt=""
                    className="w-7 aspect-square rounded-full"
                  />
                  <p className="flex-1 text-sm">
                    {m._id === authUser._id ? "You" : m.fullName}
                  </p>
                  {m._id === selectedGroup.admin && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/50">
                      Admin
                    </span>
                  )}
                  {onlineUsers.includes(m._id) && (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  )}
                  {isAdmin && m._id !== authUser._id && (
                    <button
                      onClick={() => handleRemove(m)}
                      className="text-gray-400 hover:text-red-400 cursor-pointer"
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-16 aspect-square rounded-full"
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            {onlineUsers.includes(selectedUser._id) && (
              <p className="w-2 h-2 rounded-full bg-green-500"></p>
            )}
            {selectedUser.fullName}
          </h1>
          <p className="px-10 mx-auto">{selectedUser.bio}</p>
        </div>
      )}

      <hr className="border-[#ffffff50] my-4" />

      <div className="px-5 text-xs pb-20">
        <p>Media</p>
        <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
          {msgImages.map((url, index) => (
            <div
              key={index}
              onClick={() => window.open(url)}
              className="cursor-pointer rounded"
            >
              <img src={url} alt="" className="h-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => logout()}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r
        from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;