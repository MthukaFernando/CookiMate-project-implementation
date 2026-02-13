import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; // Ensure the path is correct

console.log("Current Directory:", process.cwd());
console.log("Mongo URI is:", process.env.MONGO_URI);

// Initialize Express
const app = express();

// --- 1. CONNECT TO DATABASE ---
// We call the function from your db.js file
connectDB();

// --- 2. MIDDLEWARE ---
app.use(cors()); // Allows your React/Mobile app to talk to this server
app.use(express.json()); // Allows the server to accept JSON data (like profile pics)

// --- 3. ROUTES ---
app.get('/', (req, res) => {
  res.send("Cookimate API is running! ");
});

// --- 4. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server humming along on port ${PORT}`);
});