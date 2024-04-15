import express from "express"
import verifyJWToken from "../middlewares/auth.middleware.js";
import {sendMessage, allMessages} from "../controllers/message.controller.js"

const router = express.Router();

router.use(verifyJWToken);

router.route('/').post(verifyJWToken,sendMessage);
router.route('/:chatID').get(verifyJWToken,allMessages);


export default router;