import React, { useEffect, useState } from "react";
import { ChatState } from "../context/UserContextProvider";
import SideDrawer from "./miscellaneous/SideDrawer";
import ChatBox from "./miscellaneous/ChatBox";
import MyChats from "./miscellaneous/MyChats";

import { Box } from "@chakra-ui/react";

const Chatpage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && (
          <MyChats fetchAgain={fetchAgain}/>
        )}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
