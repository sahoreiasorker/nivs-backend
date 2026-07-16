import express from "express";
import User from "../model/user.model.js";
import { generateToken } from "../lib/jwt.js";
import { comparePassword, hashPassword } from "../lib/password.js";
import userMiddleware from "../middleware/user.middleware.js";

const router = express.Router();

// User login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = await req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: false });
    }
    const token = await generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.json({
      message: "Login successful",
      token,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// User registration route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = await req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = await generateToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.json({
      message: "User created successfully",
      token,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Get the authenticated user's data
router.get("/me", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    return res.status(200).json({
      message: "User data retrieved successfully",
      user,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Update the authenticated user's data
router.patch("/", userMiddleware, async (req, res) => {
  try {
    const isPasswordChange = req.query.password === "password";

    if (isPasswordChange) {
      const { currentPassword, password } = req.body;

      if (!currentPassword || !password) {
        return res.status(400).json({
          message: "currentPassword and password are required",
          success: false,
        });
      }

      const currentUser = await User.findById(req.user.id);
      if (!currentUser) {
        return res
          .status(404)
          .json({ message: "User not found", success: false });
      }

      const isMatch = await comparePassword(
        currentPassword,
        currentUser.password,
      );
      if (!isMatch) {
        return res.status(400).json({
          message: "Current password is incorrect",
          success: false,
        });
      }

      const hashedPassword = await hashPassword(password);
      await currentUser.updateOne({ password: hashedPassword });

      return res.status(200).json({
        message: "Password updated successfully",
        success: true,
      });
    }

    const { email, password, ...rest } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { ...rest },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Delete the authenticated user's account
router.delete("/", userMiddleware, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndUpdate(
      req.user.id,
      { deleted: true },
      { new: true },
    ).select("-password");
    return res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

export default router;
