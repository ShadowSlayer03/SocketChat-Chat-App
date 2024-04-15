import express from "express";
import {
  registerUser,
  authUser,
  getAllUsers,
} from "../controllers/user.controller.js";
import verifyJWToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(verifyJWToken,getAllUsers).post(registerUser);
router.route("/login").post(authUser);

export default router;
