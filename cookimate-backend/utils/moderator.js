import { createRequire } from 'module';
import BadWordsNext from 'bad-words-next';

// This allows us to load JSON/Files that the package "hides" from ESM
const require = createRequire(import.meta.url);
const en = require('bad-words-next/lib/en'); 

// Initialize the filter
const badwords = new BadWordsNext({ data: en });

/**
 * Checks if a string contains prohibited content.
 * @param {string} text 
 * @returns {boolean} - true if toxic, false if clean
 */
export const isContentToxic = (text) => {
  if (!text || typeof text !== 'string') return false;

  // Simple normalization to catch common bypasses
  const normalized = text
    .toLowerCase()
    .replace(/@/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/\$/g, 's')
    .replace(/\*/g, '');

  return badwords.check(text) || badwords.check(normalized);
};