import React,{useState} from 'react';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
  Box
} from "@chakra-ui/react";

const Login = () => {
  const [showOne, setShowOne] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleClickOne = ()=>{
    setShowOne(!showOne);
  }

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill All the Fields!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/user/login`,
        { email, password },
        config
      );

      toast({
        title: "Login Successful!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      
      localStorage.setItem("userInfo",JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      console.log("Error Occurred!", error);
      toast({
        title: "Login Unsuccessful!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="10px" fontFamily="Varela Round">

      <FormControl isRequired>
        <FormLabel fontWeight="400">Email</FormLabel>
        <Input className="input"
          placeholder="Enter your Email"
          borderColor="blue"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontWeight="400">Password</FormLabel>
        <InputGroup>
          <Input
            type={showOne ? "text": "password"}
            placeholder="Enter your Password"
            value={password}
            borderColor="blue"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <InputRightElement width="4.5rem">
            <Button id='show-hide-toggle' h="1.75rem" size="sm" onClick={handleClickOne}>
                {showOne ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
      colorScheme="blue"
      width="100%"
      fontWeight="400"
      style={{marginTop: 15}}
      isLoading={loading}
      onClick={submitHandler}>
        Log In
      </Button>

      <Button
      variant="solid"
      colorScheme="red"
      fontWeight="400"
      width="100%"
      onClick={()=>{
        setEmail("guest@example.com");
        setPassword("guest1234");
      }}>
        Get Guest User Credentials
      </Button>

    </VStack>
  );
}

export default Login
