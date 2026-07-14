import express from "express";
import adminMiddleware from "../middleware/admin.middleware.js";
import User from "../model/user.model.js";
import Upload from "../model/upload.model.js";
const router = express.Router();

// Get all users (admin only)
router.get("/", adminMiddleware, async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find().select("-password"); // Exclude password field
    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete a user by ID (admin only)
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    // Delete the user from the database
    const deletedUser = await User.findByIdAndUpdate(userId, {
      isDeleted: true,
    });
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update a user's information by ID (admin only)
router.patch("/:id", adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedData = req.body;
    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get a specific user by ID (admin only)
router.get("/:id", adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await user.populate("notes");
    await user.populate("images");
    await user.populate("videos");
    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all notes for a specific user by ID (admin only)
router.get("/:id/notes", adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await user.populate("notes");
    return res.json({
      success: true,
      data: user.notes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all images for a specific user by ID (admin only)
router.get("/:id/images", adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await user.populate("images");
    return res.json({
      success: true,
      data: user.images,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all videos for a specific user by ID (admin only)
router.get("/:id/videos", adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await user.populate("videos");
    return res.json({
      success: true,
      data: user.videos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all files for a specific user by ID (admin only)
router.get("/:id/files", adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await user.populate("files");
    return res.json({
      success: true,
      data: user.files,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all uploads and populate them by user ID (admin only)
router.get("/uploads", adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const upload = await Upload.find({ user: userId }).populate(
      "user",
      "-password",
    );
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: "Uploads not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: upload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
export default router;
