import { verifyToken } from "../lib/jwt.js";
import User from "../model/user.model.js";
import mongoose from "mongoose";

const DEMO_USER_ID = new mongoose.Types.ObjectId("000000000000000000000000");

const uploadMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const verified = await verifyToken(token);
    const user = await User.findById(verified.id).select("-password");

    req.id = user?._id || DEMO_USER_ID;
  } catch (error) {
    req.id = DEMO_USER_ID;
  }
  next();
};

export { uploadMiddleware };
