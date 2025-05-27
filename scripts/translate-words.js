#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration
const GOOGLE_CLOUD_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;
const WORDS_FILE_PATH = path.join(__dirname, '..', 'words.json');
const DELAY_BETWEEN_REQUESTS = 100; // milliseconds to avoid rate limiting

/**
 * Translate text using Google Cloud Translation API
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language code (default: 'th' for Thai)
 * @param {string} toLang - Target language code (default: 'en' for English)
 * @returns {Promise<string>} - Translated text
 */
async function translateText(text, fromLang = 'th', toLang = 'en') {
  const requestBody = {
    q: text,
    source: fromLang,
    target: toLang,
    format: 'text',
  };

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Cloud Translation API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data?.translations?.[0]?.translatedText || '';
  } catch (error) {
    console.error(`Translation error for "${text}":`, error.message);
    return '';
  }
}

/**
 * Add delay between API requests
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Read words from JSON file
 * @returns {Promise<Object>} - Words dictionary
 */
async function readWordsFile() {
  try {
    const data = await fs.readFile(WORDS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading words.json:', error.message);
    process.exit(1);
  }
}

/**
 * Write words to JSON file
 * @param {Object} words - Words dictionary
 */
async function writeWordsFile(words) {
  try {
    const jsonString = JSON.stringify(words, null, 2);
    await fs.writeFile(WORDS_FILE_PATH, jsonString, 'utf8');
    console.log('✅ Successfully updated words.json');
  } catch (error) {
    console.error('Error writing words.json:', error.message);
    process.exit(1);
  }
}

/**
 * Main function to translate words
 * @param {number} count - Number of words to translate (default: all)
 */
async function translateWords(count = null) {
  // Validate API key
  if (!GOOGLE_CLOUD_API_KEY) {
    console.error('❌ Error: EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY not found in environment variables');
    console.log('Please ensure you have a .env file with your Google Cloud API key');
    process.exit(1);
  }

  console.log('🔄 Reading words.json...');
  const words = await readWordsFile();

  const entries = Object.entries(words);
  const totalWords = entries.length;

  // Filter entries that need translation (empty second element)
  const wordsToTranslate = entries.filter(([thai, [english, apiTranslation]]) =>
    apiTranslation === ''
  );

  if (wordsToTranslate.length === 0) {
    console.log('✅ All words already have API translations!');
    return;
  }

  // Limit the number of words to translate if specified
  const wordsToProcess = count ? wordsToTranslate.slice(0, count) : wordsToTranslate;

  console.log(`📊 Statistics:`);
  console.log(`   Total words in file: ${totalWords}`);
  console.log(`   Words needing translation: ${wordsToTranslate.length}`);
  console.log(`   Words to process this run: ${wordsToProcess.length}`);
  console.log(`   API key: ${GOOGLE_CLOUD_API_KEY.substring(0, 10)}...`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  console.log('🚀 Starting translation process...');
  console.log('');

  for (let i = 0; i < wordsToProcess.length; i++) {
    const [thaiWord, [englishTranslation, _]] = wordsToProcess[i];

    console.log(`[${i + 1}/${wordsToProcess.length}] Translating: "${thaiWord}"`);

    try {
      const apiTranslation = await translateText(thaiWord);

      if (apiTranslation) {
        // Update the words object
        words[thaiWord][1] = apiTranslation;
        successCount++;

        console.log(`   ✅ Original: "${englishTranslation}"`);
        console.log(`   🤖 API:      "${apiTranslation}"`);

        // Check if translations match
        const similarity = englishTranslation.toLowerCase() === apiTranslation.toLowerCase();
        if (similarity) {
          console.log(`   ✨ Perfect match!`);
        } else {
          console.log(`   ⚠️  Different translation`);
        }
      } else {
        console.log(`   ❌ Translation failed`);
        errorCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errorCount++;
    }

    console.log('');

    // Add delay between requests to avoid rate limiting
    if (i < wordsToProcess.length - 1) {
      await delay(DELAY_BETWEEN_REQUESTS);
    }
  }

  // Save the updated words
  await writeWordsFile(words);

  // Summary
  console.log('📈 Translation Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📊 Success rate: ${((successCount / wordsToProcess.length) * 100).toFixed(1)}%`);

  if (wordsToTranslate.length > wordsToProcess.length) {
    const remaining = wordsToTranslate.length - wordsToProcess.length;
    console.log(`   ⏳ Remaining words: ${remaining}`);
    console.log(`   💡 Run again to translate more words`);
  }
}

/**
 * Display usage information
 */
function showUsage() {
  console.log('📖 Usage:');
  console.log('   node scripts/translate-words.js [count]');
  console.log('');
  console.log('📝 Examples:');
  console.log('   node scripts/translate-words.js        # Translate all words');
  console.log('   node scripts/translate-words.js 10     # Translate first 10 words');
  console.log('   node scripts/translate-words.js 50     # Translate first 50 words');
  console.log('');
  console.log('⚙️  Requirements:');
  console.log('   - .env file with EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY');
  console.log('   - words.json file in the project root');
  console.log('   - Internet connection for Google Cloud API');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Handle help flag
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  // Parse count argument
  let count = null;
  if (args.length > 0) {
    count = parseInt(args[0]);
    if (isNaN(count) || count <= 0) {
      console.error('❌ Error: Count must be a positive number');
      showUsage();
      process.exit(1);
    }
  }

  try {
    await translateWords(count);
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { translateWords, translateText };
