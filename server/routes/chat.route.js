import express from "express";
import verifyJWToken from "../middlewares/auth.middleware.js";
import {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    removeFromGroup,
    addToGroup
} from "../controllers/chat.controller.js";

const router = express.Router();

router.use(verifyJWToken);

router.route("/").post(accessChat);
router.route("/").get(fetchChats);
router.route("/group").post(createGroupChat);
router.route("/rename").put(renameGroup);
router.route("/groupremove").put(removeFromGroup);
router.route("/groupadd").put(addToGroup);

export default router;