import React, { useEffect, useState } from "react";
import { ChatState } from "../context/UserContextProvider";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import  Lottie  from "react-lottie";
import io from "socket.io-client";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import animationData from "../animation/typing-animation.json"
import axios from "axios";

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
    
  }

  useEffect(() => {
    socket = io(import.meta.env.VITE_BACKEND_BASE_URL);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop-typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    socket.on("message received", (newMesgReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMesgReceived.chat._id
      ) {
        if(!notification.includes(newMesgReceived)){
          setNotification([newMesgReceived,...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMesgReceived]);
      }
    });
  });

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      console.log(selectedChat._id);

      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/message/${
          selectedChat._id
        }`,
        config
      );

      console.log(messages);
      setMessages(data);
      setLoading(false);

      socket.emit("join-chat", selectedChat._id);
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to Load All Messages!",
        description: "Error Occurred!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop-typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage("");
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/message`,
          {
            content: newMessage,
            chatID: selectedChat._id,
          },
          config
        );

        socket.emit("new-message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Failed to Send Message!",
          description: "Error Occurred!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop-typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Varela Round"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat?.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div
                className="messages"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "scroll",
                  scrollbarWidth: "none",
                  "&::WebkitScrollbar": {
                    display: "none",
                  },
                }}
              >
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl display="flex" flexDirection="column" alignItems="flex-start" onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? <div style={{marginBottom: "15px", marginLeft: "0px" }}><Lottie options={defaultOptions} width={70}/></div> : <></>}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a Message.."
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Varela Round">
            Click on a User to Start Chatting!
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
