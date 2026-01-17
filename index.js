import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

// ===== CONFIG =====
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI; // set on Render
const APP_SECRET = "strong_password"; // must match exe

// ===== MONGODB =====
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

// ===== SCHEMA =====
const LicenseSchema = new mongoose.Schema({
  pc_id: { type: String, unique: true },
  status: { type: String, enum: ["OK", "BLOCKED"], default: "BLOCKED" }
});

const License = mongoose.model("License", LicenseSchema);

// ===== ROUTE =====
app.post("/check", async (req, res) => {
  try {
    const { pc_id, hash } = req.body;

    if (!pc_id || !hash) {
      return res.status(400).json({ status: "blocked" });
    }

    // simple hash check (same logic as exe)
    const crypto = await import("crypto");
    const expectedHash = crypto
      .createHash("sha256")
      .update(pc_id + APP_SECRET)
      .digest("hex");

    if (hash !== expectedHash) {
      return res.json({ status: "blocked" });
    }

    const license = await License.findOne({ pc_id });

    if (!license || license.status !== "OK") {
      return res.json({
        status: "blocked",
        message_en: "Contact YNS_77 to buy for $10",
        message_ar: "تواصل مع YNS_77 للشراء مقابل 10$"
      });
    }

    return res.json({ status: "ok" });

  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ status: "blocked" });
  }
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`🚀 License server running on port ${PORT}`);
});
