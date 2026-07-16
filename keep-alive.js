import { createClient } from "@supabase/supabase-js";
import express from "express";
import dotenv from "dotenv";
import KeepAlive from "./model/keep-alive.js";

dotenv.config();
const router = express.Router();

async function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase credentials are not defined. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

router.get("/", async (req, res) => {
  try {
    const supabase = await getSupabaseClient();

    // যেকোনো ছোট query চালাও
    const { error, data } = await supabase
      .from("test") // যেকোনো একটা table নাম দাও
      .select()
      .limit(1);

    await KeepAlive.create({
      time: new Date(),
      data: {
        data: data,
        error: error,
      },
    });
    if (error) throw error;
    return res
      .status(200)
      .json({ success: true, message: "Supabase connection is alive" });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
});

export default router;
