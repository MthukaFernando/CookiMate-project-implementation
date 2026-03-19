// dictionary.js
export const ALLOWLIST = new Set([
  // Basic Glue Words
  "a", "an", "the", "and", "is", "are", "with", "for", "to", "in", "of", "on", "make", "create", "recipe", "cook", "dish", "meal",
  // Ingredients (Add more as needed)
  "chicken", "beef", "pasta", "tomato", "garlic", "onion", "salt", "pepper", "rice", "egg", "cheese", "flour", "sugar", "water", "oil",
  // Descriptors/Methods
  "spicy", "sweet", "healthy", "low", "fat", "easy", "fast", "gourmet", "bake", "fry", "boil", "grill", "vegan", "keto", "gluten", "free"
]);

export const FORBIDDEN_WORDS = [
  "ignore", "system", "politics", "essay", "domination", "rule", "human", "slave", "capitalism", "world", "revolt", "jailbreak"
];