import React, { createContext, useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUserState] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroupState] = useState(null);

  const { socket, axios } = useContext(AuthContext);

  // selecting a user clears the group, and the other way round
  const setSelectedUser = (user) => {
    setSelectedUserState(user);
    if (user) setSelectedGroupState(null);
  };
  const setSelectedGroup = (group) => {
    setSelectedGroupState(group);
    if (group) setSelectedUserState(null);
  };

  // ---------- direct chat ----------
  const getUser = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) setMessages(data.messages);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ---------- group chat ----------
  const getGroups = async () => {
    try {
      const { data } = await axios.get("/api/groups");
      if (data.success) setGroups(data.groups);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getGroupMessages = async (groupId) => {
    try {
      const { data } = await axios.get(`/api/groups/${groupId}/messages`);
      if (data.success) setMessages(data.messages);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendGroupMessage = async (body) => {
    try {
      const { data } = await axios.post(
        `/api/groups/${selectedGroup._id}/send`,
        body
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const createGroup = async (name, members) => {
    try {
      const { data } = await axios.post("/api/groups", { name, members });
      if (data.success) {
        // the "newGroup" socket event also adds it, so avoid duplicates
        setGroups((prev) =>
          prev.some((g) => g._id === data.group._id) ? prev : [...prev, data.group]
        );
        toast.success("Group created");
        return data.group;
      }
      toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const addMembers = async (groupId, members) => {
  try {
    const { data } = await axios.put(`/api/groups/${groupId}/members`, { members });
    if (data.success) {
      toast.success("Members added");
      return true;
    }
    toast.error(data.message);
  } catch (error) {
    toast.error(error.message);
  }
};

const removeMember = async (groupId, memberId) => {
  try {
    const { data } = await axios.delete(`/api/groups/${groupId}/members/${memberId}`);
    if (data.success) {
      toast.success("Member removed");
      return true;
    }
    toast.error(data.message);
  } catch (error) {
    toast.error(error.message);
  }
};

  // ---------- socket listeners ----------
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });

    socket.on("newGroupMessage", (msg) => {
      if (selectedGroup && msg.groupId === selectedGroup._id) {
        setMessages((prev) => [...prev, msg]);
      }
      // (unread counts for groups can be added later)
    });

    socket.on("newGroup", (group) => {
      setGroups((prev) =>
        prev.some((g) => g._id === group._id) ? prev : [...prev, group]
      );
    });
    socket.on("groupUpdated", (updated) => {
  setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
  setSelectedGroupState((prev) => (prev && prev._id === updated._id ? updated : prev));
});

socket.on("groupRemoved", (groupId) => {
  setGroups((prev) => prev.filter((g) => g._id !== groupId));
  setSelectedGroupState((prev) => (prev?._id === groupId ? null : prev));
  toast("You were removed from a group");
});
  };

  const unsubscribeMessage = () => {
    if (!socket) return;
    socket.off("newMessage");
    socket.off("newGroupMessage");
    socket.off("newGroup");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeMessage();
  }, [socket, selectedUser, selectedGroup]);

  // load the user's groups once the socket (i.e. login) is ready
  useEffect(() => {
    if (socket) getGroups();
  }, [socket]);

  const value = {
    messages,
    users,
    selectedUser,
    getUser,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    groups,
    setGroups,
    selectedGroup,
    setSelectedGroup,
    getGroups,
    getGroupMessages,
    sendGroupMessage,
    createGroup,
    addMembers,
    removeMember
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};