import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { connectDB } from "./lib/db.js";

// Import routes

import videoRoutes from "./routes/video.routes.js";
import fileRoutes from "./routes/file.routes.js";
import noteRoutes from "./routes/note.routes.js";
import userRoutes from "./routes/user.routes.js";
import imageRoutes from "./routes/image.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import upload from "./routes/upload.route.js";

dotenv.config();

const app = express();
const version = "v1";

app.use(cors());
app.use(express.json());

await connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to the NIVS API");
});

app.use(`/api/${version}/videos`, videoRoutes);
app.use(`/api/${version}/files`, fileRoutes);
app.use(`/api/${version}/notes`, noteRoutes);
app.use(`/api/${version}/images`, imageRoutes);
app.use(`/api/${version}/users`, userRoutes);
app.use(`/api/${version}/admins`, adminRoutes);
app.use(`/api/${version}/upload`, upload);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
