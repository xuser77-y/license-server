import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ===== MONGODB =====
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

// ===== SCHEMA =====
const LicenseSchema = new mongoose.Schema({
  pc_id: { type: String, unique: true },
  status: { type: String, default: "BLOCKED" }
});

const License = mongoose.model("License", LicenseSchema);

// ===== CHECK ROUTE =====
app.post("/check", async (req, res) => {
  try {
    const { pc_id } = req.body;

    console.log("CHECKING PC_ID:", pc_id);

    if (!pc_id) {
      return res.json({ status: "blocked" });
    }

    const license = await License.findOne({ pc_id });

    console.log("LICENSE FROM DB:", license);

    if (!license || license.status !== "OK") {
      return res.json({ status: "blocked" });
    }

    return res.json({ status: "ok" });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.json({ status: "blocked" });
  }
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
