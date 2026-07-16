import express from "express";
import File from "../model/file.model.js";
import User from "../model/user.model.js";
import userMiddleware from "../middleware/user.middleware.js";

const router = express.Router();

// Get all files for the authenticated user
router.get("/", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const files = await File.find({ user: user._id, isDeleted: false }).sort({
      createdAt: -1,
    });
    return res.json({
      message: "Files retrieved successfully",
      data: files,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Create a new file for the authenticated user
router.post("/", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const file = await File.create({ ...req.body, user: user._id });
    user.files.push(file._id);
    await user.save();
    return res.status(201).json({
      message: "File created successfully",
      data: file,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Update a specific file by ID for the authenticated user
router.patch("/:id", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, user: user._id },
      { ...req.body },
      { new: true },
    );
    if (!file) {
      return res
        .status(404)
        .json({ message: "File not found", success: false });
    }
    return res.json({
      message: "File updated successfully",
      data: file,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Delete a specific file by ID for the authenticated user
router.delete("/:id", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, user: user._id },
      { isDeleted: true },
      { new: true },
    );
    if (!file) {
      return res
        .status(404)
        .json({ message: "File not found", success: false });
    }
    user.files.pull(file._id);
    await user.save();
    return res.json({
      message: "File deleted successfully",
      data: file,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

export default router;
