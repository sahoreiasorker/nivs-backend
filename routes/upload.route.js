// import express from "express";
// import multer from "multer";
// import {
//   ALLOWED_FILE_TYPES,
//   ALLOWED_IMAGE_TYPES,
//   MAX_FILE_SIZE,
//   MAX_IMAGE_SIZE,
// } from "../lib/upload.js";
// import { uploadImageToImgbb } from "../lib/imgbb.js";
// import {
//   uploadContentToSupabase,
//   uploadFileToSupabase,
// } from "../lib/supabase.js";
// import Upload from "../model/upload.model.js";
// import { uploadMiddleware } from "../middleware/upload.middleware.js";
// const router = express.Router();

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: MAX_FILE_SIZE, files: 10 },
// });

// router.post(
//   "/",
//   uploadMiddleware,
//   upload.array("files", 10),
//   async (req, res) => {
//     console.log("POST /upload called");
//     try {
//       // ─── Option 1: Text/Code content → Supabase ───
//       const { contentType, content, filename: customFilename } = req.body;

//       if (contentType && content) {
//         const result = await uploadContentToSupabase(
//           content,
//           contentType,
//           customFilename || undefined,
//         );
//         console.log("Content uploaded to Supabase:", result);
//         const file = {
//           filename: result.filename,
//           originalName: result.originalName,
//           url: result.url,
//           type: result.type,
//         };
//         console.log("Saving upload record to database for user:", file);
//         await Upload.create({
//           user: req?.id,
//           filename: result.filename,
//           originalName: result.originalName,
//           url: result.url,
//           type: result.type,
//         });
//         return res.status(201).json({
//           success: true,
//           message: "Content uploaded successfully",
//           file,
//         });
//       }

//       // ─── Option 2: Actual files ───
//       const files = req.files;

//       if (!files || files.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "No files or content provided",
//         });
//       }

//       if (files.length > 10) {
//         return res.status(400).json({
//           success: false,
//           message: "Maximum 10 files allowed",
//         });
//       }

//       const results = [];
//       const errors = [];

//       for (const file of files) {
//         const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
//         const isAllowed =
//           isImage ||
//           ALLOWED_FILE_TYPES.includes(file.mimetype) ||
//           file.mimetype.startsWith("text/");
//         const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

//         if (!isAllowed) {
//           errors.push(`${file.originalname}: File type not allowed`);
//           continue;
//         }

//         if (file.size > maxSize) {
//           errors.push(
//             `${file.originalname}: Too large (max ${isImage ? "5MB" : "10MB"})`,
//           );
//           continue;
//         }

//         try {
//           let result;

//           if (isImage) {
//             result = await uploadImageToImgbb(file);
//           } else {
//             result = await uploadFileToSupabase(file);
//           }
//           await Upload.create({
//             user: req?.id,
//             filename: result.filename,
//             originalName: result.originalName,
//             url: result.url,
//             type: result.type,
//           });
//           results.push({
//             filename: result.filename,
//             originalName: result.originalName,
//             url: result.url,
//             type: result.type,
//           });
//         } catch (err) {
//           errors.push(`${file.originalname}: Upload failed`);
//           console.error(`Upload error for ${file.originalname}:`, err);
//         }
//       }

//       if (results.length === 0) {
//         return res.status(500).json({
//           success: false,
//           message: "All uploads failed",
//           errors,
//         });
//       }

//       return res.status(201).json({
//         success: true,
//         message: `${results.length} file(s) uploaded successfully`,
//         files: results,
//         errors: errors.length > 0 ? errors : undefined,
//       });
//     } catch (error) {
//       console.error("POST /upload error:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//       });
//     }
//   },
// );

// export default router;

import express from "express";
import multer from "multer";
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
} from "../lib/upload.js";
import { uploadImageToImgbb } from "../lib/imgbb.js";
import {
  uploadContentToSupabase,
  uploadFileToSupabase,
} from "../lib/supabase.js";
import Upload from "../model/upload.model.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
});

// ── Validate single file, return { ok, error } ──
function validateFile(file) {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  const isAllowed =
    isImage ||
    ALLOWED_FILE_TYPES.includes(file.mimetype) ||
    file.mimetype.startsWith("text/");

  if (!isAllowed) {
    return {
      ok: false,
      isImage,
      error: `${file.originalname}: File type not allowed`,
    };
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return {
      ok: false,
      isImage,
      error: `${file.originalname}: Too large (max ${isImage ? "12MB" : "200MB"})`,
    };
  }

  return { ok: true, isImage };
}

router.post(
  "/",
  upload.array("files", 10),
  uploadMiddleware,
  async (req, res) => {
    try {
      // ─── Option 1: Text/Code content → Supabase ───
      const { contentType, content, filename: customFilename } = req.body;

      if (contentType && content) {
        const result = await uploadContentToSupabase(
          content,
          contentType,
          customFilename || undefined,
        );

        const saved = await Upload.create({
          user: req.id,
          filename: result.filename,
          originalName: result.originalName,
          url: result.url,
          type: result.type,
        });

        return res.status(201).json({
          success: true,
          message: "Content uploaded successfully",
          file: {
            _id: saved._id,
            filename: result.filename,
            originalName: result.originalName,
            url: result.url,
            type: result.type,
          },
        });
      }

      // ─── Option 2: Actual files ───
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files or content provided",
        });
      }

      if (files.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 files allowed",
        });
      }

      const results = [];
      const errors = [];

      for (const file of files) {
        const check = validateFile(file);
        if (!check.ok) {
          errors.push(check.error);
          continue;
        }

        try {
          const result = check.isImage
            ? await uploadImageToImgbb(file)
            : await uploadFileToSupabase(file);

          const saved = await Upload.create({
            user: req.id,
            filename: result.filename,
            originalName: result.originalName,
            url: result.url,
            type: result.type,
          });

          results.push({
            _id: saved._id,
            filename: result.filename,
            originalName: result.originalName,
            url: result.url,
            type: result.type,
          });
        } catch (err) {
          errors.push(`${file.originalname}: Upload failed`);
          console.error(`Upload error for ${file.originalname}:`, err);
        }
      }

      if (results.length === 0) {
        return res.status(500).json({
          success: false,
          message: "All uploads failed",
          errors,
        });
      }

      return res.status(201).json({
        success: true,
        message: `${results.length} file(s) uploaded successfully`,
        files: results,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("POST /upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

export default router;
