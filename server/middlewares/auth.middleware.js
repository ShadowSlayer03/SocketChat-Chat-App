import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWToken = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "").trim();
    
        if(!token){
            res.status(401);
            throw new Error("Unauthorized Access!");
        }
    
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password");
    
        if (!user) {
            res.status(401);
            throw new Error("Invalid Access Token!");
        }
    
        req.user = user;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Something went wrong in verification of token!");
    }
});

export default verifyJWToken;