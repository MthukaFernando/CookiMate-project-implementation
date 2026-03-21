// app.js - Express app for testing
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

// Initialize Express
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
    res.json({ message: 'CookiMate API is running' });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

export default app;