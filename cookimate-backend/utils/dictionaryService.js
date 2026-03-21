import Dictionary from "../models/Dictionary.js";
import pkg from "natural";
const { PorterStemmer } = pkg;

let dictionaryCache = null;
let stemmedAllowlistCache = null;
let forbiddenWordsCache = null;

//Load all dictionary terms from MongoDB and build the allowlist

export async function loadDictionary() {
  try {
    // Fetch all dictionary categories
    const dictionaryDocs = await Dictionary.find({});

    if (!dictionaryDocs || dictionaryDocs.length === 0) {
      console.warn("⚠️ No dictionary data found in MongoDB");
      return null;
    }

    // Combine all terms from all categories (excluding forbidden)
    const allTerms = new Set();
    const forbiddenTerms = new Set();

    dictionaryDocs.forEach((doc) => {
      if (doc.category === "forbidden") {
        doc.terms.forEach((term) => forbiddenTerms.add(term.toLowerCase()));
      } else {
        doc.terms.forEach((term) => allTerms.add(term.toLowerCase()));
      }
    });

    dictionaryCache = allTerms;
    forbiddenWordsCache = forbiddenTerms;

    // Pre-compute stemmed allowlist
    stemmedAllowlistCache = new Set(
      [...allTerms].map((w) => PorterStemmer.stem(w)),
    );

    console.log(
      `📚 Dictionary loaded: ${allTerms.size} culinary terms, ${forbiddenTerms.size} forbidden words`,
    );

    return {
      allTerms,
      forbiddenTerms,
      stemmedAllowlist: stemmedAllowlistCache,
    };
  } catch (error) {
    console.error("Failed to load dictionary from MongoDB:", error);
    throw error;
  }
}

//Get the loaded dictionary terms

export function getDictionary() {
  if (!dictionaryCache) {
    throw new Error("Dictionary not loaded yet. Call loadDictionary() first.");
  }
  return {
    allowlist: dictionaryCache,
    forbiddenWords: forbiddenWordsCache,
    stemmedAllowlist: stemmedAllowlistCache,
  };
}

// Check if dictionary is loaded

export function isDictionaryLoaded() {
  return dictionaryCache !== null;
}

//Initialize dictionary on server startup

export async function initDictionary() {
  try {
    await loadDictionary();
    // Refresh dictionary every hour
    setInterval(async () => {
      console.log("🔄 Refreshing dictionary from MongoDB...");
      await loadDictionary();
    }, 3600000); // 1 hour
  } catch (error) {
    console.error("Dictionary initialization failed:", error);
  }
}
