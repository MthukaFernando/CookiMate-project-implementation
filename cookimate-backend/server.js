const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- IMPORT ROUTES ---
// This links the files together
const feedRoutes = require('./routes/feed');
// const userRoutes = require('./routes/users'); // Example for teammate
// const authRoutes = require('./routes/auth');   // Example for teammate

// --- USE ROUTES ---
// This says: "Any URL that starts with /feed, go look in the feed.js file"
app.use('/feed', feedRoutes); 

// app.use('/users', userRoutes); // Teammate's route
// app.use('/auth', authRoutes);  // Teammate's route

// Health check
app.get('/', (req, res) => {
  res.send('CookiMate Backend is Running!');
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});