import { isValidObjectId } from "mongoose";
import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";

const sendMessage = asyncHandler(async (req, res, next) => {
    const { content, chatID } = req.body;
    const user = req.user;
  
    if (!content) {
      res.status(400);
      return next(new Error("No Message Content Provided!"));
    }
  
    if (!chatID || !isValidObjectId(chatID)) {
      res.status(400);
      return next(new Error("Chat ID Not Provided or Invalid!"));
    }
  
    if (!user) {
      res.status(400);
      return next(new Error("User Could Not be Authenticated!"));
    }
  
    var newMessage = {
      sender: user._id,
      content,
      chat: chatID
    };
  
    try {
      let result = await Message.create(newMessage);
      result = await result.populate("sender", "name pic");
      result = await result.populate("chat");
      result = await User.populate(result, {
        path: "chat.users",
        select: "name pic email"
      });
  
      await Chat.findByIdAndUpdate(chatID, {
        latestMessage: result
      });
  
      res.status(200).json(result);
  
    } catch (error) {
      res.status(500);
      return next(new Error(`Error Occurred in Sending Message! - ${error}`)); // Ensure template literals are used correctly
    }
  });

const allMessages = asyncHandler(async (req, res, next) => {
  const { chatID } = req.params;

  if (!chatID || !isValidObjectId(chatID)) {
    res.status(400);
    return next(new Error("Chat ID Not Provided or Invalid!"));
  }

  try {
    const messages = await Message.find({ chat: chatID })
      .populate("sender", "-password")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500);
    return next(new Error(`Error Occurred in Fetching Messages! - ${error}`));
  }
});

export { sendMessage, allMessages };
