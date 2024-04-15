import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";

// Checks if logged in user and provided userID user
// have a chat among them, if not create a new chat.
const accessChat = asyncHandler(async (req, res, next) => {
  const { userID } = req.body; // User other than the one logged in

  if (!userID) {
    res.status(400);
    return next(new Error("UserID Not Provided!"));
  }

  if (!req.user) {
    res.status(401);
    return next(
      new Error(
        "Authentication failed: No user found from token. Please Log In Again!"
      )
    );
  }
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userID } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let newChat = new Chat({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userID],
    });

    try {
      const savedChat = await newChat.save();

      const retrieveSavedChat = await Chat.findOne({
        _id: savedChat._id,
      }).populate("users", "-password");

      if (!retrieveSavedChat) {
        res.status(501);
        return next(new Error("New Chat Was Not Saved!"));
      }

      res.status(200).json(retrieveSavedChat);
    } catch (error) {
      res.status(500);
      return next(new Error(error.message));
    }
  }
});

// Fetches all chats of the logged in user
const fetchChats = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(
      new Error(
        "Authentication failed: No user found from token. Please Log In Again!"
      )
    );
  }

  try {
    let chat = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).json(chat);
  } catch (error) {
    res.status(500);
    return next(new Error(`Could Not Fetch Chats! - ${error}`));
  }
});

const createGroupChat = asyncHandler(async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill All the Fields!" });
  }

  if (!req.user) {
    res.status(401);
    return next(
      new Error(
        "Authentication failed: No user found from token. Please Log In Again!"
      )
    );
  }

  let users = JSON.parse(req.body.users);


  if (users.length <= 2) {
    return res.status(400).send("More than 2 users Required for a Group Chat!");
  }

  users.push(req.user);

  try {
    const groupChat = new Chat({
      chatName: req.body.name,
      users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const savedChat = await groupChat.save();

    const retrieveSavedChat = await Chat.findOne({
      _id: savedChat._id,
    }).populate("users", "-password");

    if (!retrieveSavedChat) {
      res.status(501);
      return next(new Error("Group Chat Was Not Saved!"));
    }

    res.status(200).json(retrieveSavedChat);
  } catch (error) {
    res.status(500);
    return next(new Error("Error Occurred while Creating a Group Chat!"));
  }
});

// Updates name of the Group Chat
const renameGroup = asyncHandler(async (req, res, next) => {
  const { chatID, newChatName } = req.body;

  if (!chatID || !newChatName) {
    res.status(401);
    return next(new Error("Required Fields Not Provided!"));
  }

  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatID, isGroupChat: true },
      { chatName: newChatName },
      { runValidators: true, new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!chat) {
      res.status(404);
      return next(new Error("Chat Not Found or Could Not be Updated!"));
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500);
    return next(new Error("Error Occurred while Updating Chat!"));
  }
});

// Removes a participant from Group
const removeFromGroup = asyncHandler(async (req, res, next) => {
  const { userID, groupID } = req.body;

  if (!userID || !groupID) {
    res.status(400);
    return next(new Error("Required UserID or GroupID Not Provided!"));
  }

  try {
    const chat = await Chat.findOne({ _id: groupID, isGroupChat: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!chat) {
      res.status(404);
      return next(new Error("Group Chat Not Found!"));
    }

    const user = await User.findById(userID);
    if (!user) {
      res.status(404);
      return next(new Error("User Not Found!"));
    }

    chat.users.pull(userID);

    const savedChat = await chat.save();

    if (!savedChat) {
      res.status(500);
      return next(new Error("Chat Was Not Saved!"));
    }

    res.status(200).json(savedChat);
  } catch (error) {
    res.status(500);
    return next(
      new Error(`Error occurred while Removing From Group! - ${error.message}`)
    );
  }
});

// Adds a participant to Group
const addToGroup = asyncHandler(async (req, res, next) => {
  const { userID, groupID } = req.body;

  if (!userID || !groupID) {
    res.status(400);
    return next(new Error("Required UserID or GroupID Not Provided!"));
  }

  try {
    const chat = await Chat.findOne({ _id: groupID, isGroupChat: true });

    if (!chat) {
      res.status(404);
      return next(new Error("Group Chat Not Found!"));
    }

    if (chat.users.some((user) => user._id.toString() === userID)) {
      res.status(400);
      return next(new Error("User Already in the Group!"));
    }

    const user = await User.findById(userID);
    if (!user) {
      res.status(404);
      return next(new Error("User Not Found!"));
    }

    chat.users.push(userID);

    const savedChat = await chat.save();

    const populatedChat = await Chat.findById(savedChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!populatedChat) {
      res.status(500);
      return next(new Error("Chat Was Not Saved!"));
    }

    res.status(200).json(populatedChat);
  } catch (error) {
    res.status(500);
    return next(
      new Error(`Error occurred while Adding to Group! - ${error.message}`)
    );
  }
});

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
