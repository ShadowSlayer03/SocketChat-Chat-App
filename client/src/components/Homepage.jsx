import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
} from "@chakra-ui/react";

import Login from "./Login.jsx";
import SignUp from "./SignUp.jsx";

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Container maxW="lg" centerContent>
      <Box
        className="box"
        display="flex"
        justifyContent="center"
        p="5px"
        w="90%"
        m="20px 0 10px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text
          textAlign="center"
          fontSize="5xl"
          fontFamily="Righteous"
          color="navy"
        >
          SocketChat
        </Text>
      </Box>
      <Box className="mainbox">
        <Tabs variant="soft-rounded" colorScheme="purple">
          <TabList mb="10px">
            <Tab width="50%" mr="10px">
              Login
            </Tab>
            <Tab width="50%">Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Homepage;
