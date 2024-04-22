import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter All Fields!");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User Exists Already!");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  console.log("User", user);

  let token = await user.generateToken();

  console.log("Token", token);

  if (!token) {
    res.status(500);
    throw new Error("Failed to Create a JWT Token!");
  }

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token,
    });
  } else {
    res.status(500);
    throw new Error("Failed to Create a New User!");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (email === "" || password == "") {
    res.status(400);
    throw new Error("Email and Password Required!");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User Does Not Exist!");
  }

  let result = await user.isPasswordCorrect(password);

  if (!result) {
    res.status(400);
    throw new Error("Invalid User Password!");
  }

  let token = await user.generateToken();

  if (!token) {
    res.status(500);
    throw new Error("Failed to Create a JWT Token!");
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    token,
    createdAt: user.createdAt
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.status(200).json(users);
});

export { registerUser, authUser, getAllUsers };
