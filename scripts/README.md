# Translation Utility Scripts

This directory contains utility scripts for managing translations in the Google Translate app.

## translate-words.js

A Node.js utility script that reads Thai words from `words.json`, translates them using the Google Cloud Translation API, and updates the file with API translations.

### Features

- ✅ **Batch translation** of Thai words to English
- ✅ **Rate limiting** to avoid API quota issues
- ✅ **Progress tracking** with detailed console output
- ✅ **Error handling** and retry logic
- ✅ **Comparison** between manual and API translations
- ✅ **Resumable** - only translates words with empty API translations
- ✅ **Configurable** - specify number of words to translate

### Prerequisites

1. **Google Cloud API Key**: Set up in `.env` file
2. **Internet connection**: For API calls
3. **Node.js**: Version 18+ (for fetch support)
4. **Dependencies**: Run `npm install` to install `dotenv`

### Usage

#### Command Line

```bash
# Translate all words that need translation
node scripts/translate-words.js

# Translate only the first 10 words
node scripts/translate-words.js 10

# Translate first 50 words
node scripts/translate-words.js 50

# Show help
node scripts/translate-words.js --help
```

#### Using npm scripts

```bash
# Translate all words
npm run translate-words

# Translate specific number (pass arguments after --)
npm run translate-words -- 10
```

### Output Format

The script updates the `words.json` file structure:

**Before:**
```json
{
  "สวัสดี": ["Hello", ""]
}
```

**After:**
```json
{
  "สวัสดี": ["Hello", "Hello"]
}
```

### Console Output

The script provides detailed progress information:

```
🔄 Reading words.json...
📊 Statistics:
   Total words in file: 200
   Words needing translation: 200
   Words to process this run: 10
   API key: AIzaSyAjrw...

🚀 Starting translation process...

[1/10] Translating: "สวัสดี"
   ✅ Original: "Hello"
   🤖 API:      "Hello"
   ✨ Perfect match!

[2/10] Translating: "ขอบคุณ"
   ✅ Original: "Thank you"
   🤖 API:      "Thank you"
   ✨ Perfect match!

📈 Translation Summary:
   ✅ Successful: 10
   ❌ Failed: 0
   📊 Success rate: 100.0%
   ⏳ Remaining words: 190
   💡 Run again to translate more words

✅ Successfully updated words.json
```

### Configuration

Edit the script to modify these settings:

```javascript
const DELAY_BETWEEN_REQUESTS = 100; // milliseconds between API calls
const WORDS_FILE_PATH = path.join(__dirname, '..', 'words.json');
```

### Error Handling

The script handles various error scenarios:

- **Missing API key**: Clear error message with setup instructions
- **Network errors**: Continues with next word, reports in summary
- **API rate limits**: Built-in delay between requests
- **File errors**: Graceful error messages for read/write issues
- **Invalid arguments**: Usage help and validation

### API Usage Considerations

- **Rate Limiting**: 100ms delay between requests (configurable)
- **Cost**: ~$20 per 1 million characters translated
- **Quotas**: Check your Google Cloud console for limits
- **Resumable**: Run multiple times to process large datasets

### Troubleshooting

#### "API key not found" error
```bash
# Ensure .env file exists with your API key
cp env.example .env
# Edit .env and add your Google Cloud API key
```

#### "Permission denied" error
- Verify API key has Translation API permissions
- Check that Translation API is enabled in Google Cloud Console

#### "Rate limit exceeded" error
- Increase `DELAY_BETWEEN_REQUESTS` value
- Process fewer words at a time

#### Network timeout errors
- Check internet connection
- Try processing smaller batches

### Best Practices

1. **Start small**: Test with 5-10 words first
2. **Monitor costs**: Check Google Cloud billing
3. **Backup data**: Keep a copy of original `words.json`
4. **Review results**: Check translation quality manually
5. **Batch processing**: Process large datasets in chunks

### Example Workflow

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp env.example .env
# Edit .env with your API key

# 3. Test with small batch
npm run translate-words -- 5

# 4. Review results in words.json

# 5. Process larger batches
npm run translate-words -- 50

# 6. Continue until all words are translated
npm run translate-words
```

### Integration with App

The translated words can be used in your React Native app:

```javascript
import words from '../words.json';

// Get API translation
const apiTranslation = words['สวัสดี'][1]; // "Hello"

// Compare with manual translation
const manualTranslation = words['สวัสดี'][0]; // "Hello"
```

This allows you to:
- Compare translation quality
- Use as offline fallback
- Validate API responses
- Build learning features
