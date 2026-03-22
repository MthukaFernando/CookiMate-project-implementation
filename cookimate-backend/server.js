import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userPreferencesRoutes from "./routes/userPreferencesRoutes.js";
import { initDictionary } from "./utils/dictionaryService.js";
import { initDictionaryForController } from "./controllers/aiController.js";

// Initialize Express
const app = express();

console.log("Current Directory:", process.cwd());
console.log("Mongo URI is:", process.env.MONGO_URI);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// --- ROUTES ---
app.get("/", (req, res) => {
  res.send("Cookimate API is running! ");
});

app.use("/api/users", userRoutes);
app.use("/api/users", userPreferencesRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/gamification", gamificationRoutes);

// Health check endpoint
app.get("/api/health/dictionary", async (req, res) => {
  try {
    const { isDictionaryLoaded, getDictionary } =
      await import("./utils/dictionaryService.js");
    const loaded = isDictionaryLoaded();
    res.json({
      dictionaryLoaded: loaded,
      status: loaded ? "ready" : "loading",
      terms: loaded ? getDictionary().allowlist.size : 0,
    });
  } catch (error) {
    res.json({
      dictionaryLoaded: false,
      status: "error",
      error: error.message,
    });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

// Connect to database and initialize dictionary before starting server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB connected successfully");

    // Initialize dictionary from MongoDB
    console.log("📚 Loading dictionary from MongoDB...");
    await initDictionary();
    await initDictionaryForController();
    console.log("✅ Dictionary loaded and ready");

    // Start the server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server humming along on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the application
startServer();
