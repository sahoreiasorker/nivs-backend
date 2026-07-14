import { verifyToken } from "../lib/jwt.js";
import User from "../model/user.model.js";

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const verified = await verifyToken(token);
    if (!verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    if (verified.role !== "admin") {
      return res.status(403).json({ message: "Forbidden", success: false });
    }
    const admin = await User.findById(verified.id).select("-password");
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin user not found", success: false });
    }
    if (admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admins only.", success: false });
    }
    req.user = verified;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export default adminMiddleware;
