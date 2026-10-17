import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/chatContext";

const Sidebar = () => {
  const {
    getUser,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    groups,
    selectedGroup,
    setSelectedGroup,
    createGroup,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [pickedMembers, setPickedMembers] = useState([]);

  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  const filteredGroups = input
    ? groups.filter((g) => g.name.toLowerCase().includes(input.toLowerCase()))
    : groups;

  useEffect(() => {
    getUser();
  }, [onlineUsers]);

  const navigate = useNavigate();

  const toggleMember = (id) => {
    setPickedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setGroupName("");
    setPickedMembers([]);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Enter a group name");
    if (pickedMembers.length < 1) return toast.error("Pick at least one member");

    const group = await createGroup(groupName.trim(), pickedMembers);
    if (group) closeModal();
  };

  const chatOpen = selectedUser || selectedGroup;

  return (
    <div
      className={`bg-[#282142] border-r-2 p-5 h-full rounded-r-xl overflow-y-scroll text-white ${
        chatOpen ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        {/* TOP BAR */}
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max w-40" />

          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max h-5 cursor-pointer"
            />

            <div
              className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600
             text-gray-100 hidden group-hover:block"
            >
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>

              <hr className="my-2 border-t border-gray-500" />

              <p onClick={() => logout()} className="cursor-pointer text-sm">
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center gap-2 bg-[#3b3659] rounded-md p-2 mt-5">
          <img src={assets.search_icon} alt="Search" className="max h-5" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Search User or Group..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder-[#c8c8c8] flex-1"
          />
        </div>
      </div>

      {/* GROUP LIST */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-wide text-gray-400">Groups</p>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs bg-violet-500/50 hover:bg-violet-500/70 px-2 py-1 rounded-full cursor-pointer"
        >
          + New
        </button>
      </div>

      <div className="flex flex-col mb-4">
        {filteredGroups.length === 0 && (
          <p className="text-xs text-gray-500 pl-4 py-2">No groups yet</p>
        )}
        {filteredGroups.map((group) => (
          <div
            key={group._id}
            onClick={() => setSelectedGroup(group)}
            className={`flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedGroup?._id === group._id ? "bg-amber-50 text-black" : ""
            }`}
          >
            {group.groupPic ? (
              <img
                src={group.groupPic}
                alt="Group"
                className="w-8.75 aspect-square rounded-full"
              />
            ) : (
              <div className="w-8.75 aspect-square rounded-full bg-violet-500/50 flex items-center justify-center text-sm font-medium text-white">
                {group.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col leading-5">
              <p>{group.name}</p>
              <span className="text-neutral-400 text-xs">
                {group.members?.length} members
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* USER LIST */}
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
        Direct messages
      </p>
      <div className="flex flex-col">
        {filteredUsers.map((user, index) => (
          <div
            key={index}
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
            }}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id ? "bg-amber-50 text-black" : ""
            }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt="User"
              className="w-8.75 aspect-square rounded-full"
            />

            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
            </div>

            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* CREATE GROUP MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-[#282142] border border-gray-600 rounded-xl p-5 w-full max-w-sm text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-medium mb-3">Create group</p>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full bg-[#3b3659] rounded-md p-2 text-sm outline-none placeholder-[#c8c8c8] mb-3"
            />

            <p className="text-xs text-gray-400 mb-2">
              Select members ({pickedMembers.length})
            </p>
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1 mb-4">
              {users.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white/10"
                >
                  <input
                    type="checkbox"
                    checked={pickedMembers.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                  />
                  <img
                    src={user.profilePic || assets.avatar_icon}
                    alt=""
                    className="w-6 aspect-square rounded-full"
                  />
                  <span className="text-sm">{user.fullName}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="text-sm px-3 py-1.5 rounded-full border border-gray-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="text-sm px-3 py-1.5 rounded-full bg-violet-500 cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;