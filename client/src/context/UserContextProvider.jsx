import React, { useContext, useEffect, useState } from "react";
import UserContext from "./UserContext";
import { useNavigate } from "react-router-dom";

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // console.log("Inside UserContextProvider",userInfo);
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(UserContext);
};

export default UserContextProvider;
