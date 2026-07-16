import express from "express";
import userMiddleware from "../middleware/user.middleware.js";
import User from "../model/user.model.js";
import Image from "../model/image.model.js";

const router = express.Router();
// Create a new image
router.post("/", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const image = await Image.create({
      user: user._id,
      ...req.body,
    });
    user.images.push(image._id);
    await user.save();
    return res.status(201).json({
      message: "Image created successfully",
      success: true,
      data: image,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Get all images for the authenticated user
router.get("/", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const images = await Image.find({ user: user._id, isDeleted: false }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      message: "Images fetched successfully",
      success: true,
      data: images,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Get a specific image by ID for the authenticated user
router.patch("/:id", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const image = await Image.findOneAndUpdate(
      { _id: req.params.id, user: user._id, isDeleted: false },
      req.body,
      { new: true },
    );
    if (!image) {
      return res
        .status(404)
        .json({ message: "Image not found", success: false });
    }
    return res.status(200).json({
      message: "Image updated successfully",
      success: true,
      data: image,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Delete a specific image by ID for the authenticated user
router.delete("/:id", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const image = await Image.findOneAndUpdate(
      { _id: req.params.id, user: user._id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!image) {
      return res
        .status(404)
        .json({ message: "Image not found", success: false });
    }
    user.images.pull(image._id);
    await user.save();
    return res.status(200).json({
      message: "Image deleted successfully",
      success: true,
      data: image,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

export default router;
