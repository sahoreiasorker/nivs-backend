import mongoose from "mongoose";

const KeepAliveSchema = new mongoose.Schema(
  {
    time: {
      type: Date,
      default: Date.now,
    },
    data: {
      type: Object,
    },
  },
  { timestamps: true },
);

const KeepAlive = mongoose.model("KeepAlive", KeepAliveSchema);

export default KeepAlive;
