import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import UserContextProvider from "./context/UserContextProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserContextProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </UserContextProvider>
  </BrowserRouter>
);
