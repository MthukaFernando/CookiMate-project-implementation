// scripts/seedDictionary.js
import mongoose from "mongoose";
import Dictionary from "../models/Dictionary.js";
import fs from "fs";

// Your dictionary data from the JSON you provided
const dictionaryData = [
  // Paste the dictionary data from your JSON here
  // The array of objects with category, name, description, terms
];

async function seedDictionary() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing dictionary data
    await Dictionary.deleteMany({});
    console.log("Cleared existing dictionary data");

    // Insert new data
    await Dictionary.insertMany(dictionaryData);
    console.log(`✅ Seeded ${dictionaryData.length} dictionary categories`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding dictionary:", error);
    process.exit(1);
  }
}

seedDictionary();
