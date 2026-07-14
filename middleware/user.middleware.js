import { verifyToken } from "../lib/jwt.js";

const userMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const verified = await verifyToken(token);
    if (!verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    req.user = verified;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export default userMiddleware;
