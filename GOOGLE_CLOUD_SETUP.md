# Google Cloud APIs Setup Guide

This project uses Google Cloud APIs directly from the client for translation, text-to-speech, and speech-to-text functionality.

## Required Google Cloud APIs

1. **Cloud Speech-to-Text API** - For audio transcription
2. **Cloud Text-to-Speech API** - For speech synthesis  
3. **Cloud Translation API** - For text translation

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Required APIs

Enable the following APIs in your Google Cloud project:

```bash
gcloud services enable speech.googleapis.com
gcloud services enable texttospeech.googleapis.com
gcloud services enable translate.googleapis.com
```

Or enable them through the Google Cloud Console:
- [Cloud Speech-to-Text API](https://console.cloud.google.com/apis/library/speech.googleapis.com)
- [Cloud Text-to-Speech API](https://console.cloud.google.com/apis/library/texttospeech.googleapis.com)
- [Cloud Translation API](https://console.cloud.google.com/apis/library/translate.googleapis.com)

### 3. Create API Key

1. Go to [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Recommended) Restrict the API key to only the required APIs for security

### 4. Configure Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Google Cloud API key:
   ```env
   EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_actual_api_key_here
   ```

3. Make sure `.env` is in your `.gitignore` file (it should be by default)

## API Usage

### Speech-to-Text
- **Input**: Base64 encoded audio (MP4/M4A format)
- **Output**: Transcribed text
- **Language**: Automatically detected or specified based on target language

### Text-to-Speech
- **Input**: Text to synthesize
- **Optional Parameters**: 
  - Language is automatically detected from the target translation language
  - Voice is automatically selected based on language
- **Output**: Base64 encoded MP3 audio

### Translation
- **Input**: 
  - `input`: Text to translate
  - `from`: Source language name (e.g., "English")
  - `to`: Target language name (e.g., "Spanish")
- **Output**: Translated text

## Language Codes

The app automatically converts language names to codes. Supported languages include:
- English: `en` → `en-US`
- Spanish: `es` → `es-ES`
- French: `fr` → `fr-FR`
- German: `de` → `de-DE`
- Italian: `it` → `it-IT`
- Portuguese: `pt` → `pt-BR`
- Chinese: `zh` → `zh-CN`
- Japanese: `ja` → `ja-JP`
- Korean: `ko` → `ko-KR`
- And many more...

## Voice Options for Text-to-Speech

The app automatically selects appropriate voices:
- **English**: `en-US-Standard-A` (Female)
- **Spanish**: `es-ES-Standard-A` (Female)
- **French**: `fr-FR-Standard-A` (Female)
- **German**: `de-DE-Standard-A` (Female)
- **Italian**: `it-IT-Standard-A` (Female)
- **Portuguese**: `pt-BR-Standard-A` (Female)
- **Chinese**: `zh-CN-Standard-A` (Female)
- **Japanese**: `ja-JP-Standard-A` (Female)
- **Korean**: `ko-KR-Standard-A` (Female)

For other languages, check the [Google Cloud Text-to-Speech documentation](https://cloud.google.com/text-to-speech/docs/voices).

## Cost Considerations

Google Cloud APIs have usage-based pricing:
- **Speech-to-Text**: ~$0.006 per 15 seconds
- **Text-to-Speech**: ~$4.00 per 1 million characters
- **Translation**: ~$20.00 per 1 million characters

Check current pricing at [Google Cloud Pricing](https://cloud.google.com/pricing).

## Security Considerations

- API key is exposed in the client app
- Suitable for development and small-scale applications
- Consider API key restrictions to limit usage and prevent abuse
- For production applications, consider implementing server-side proxy

## Error Handling

The app includes proper error handling:
- Invalid API keys will show helpful error messages
- Network errors are caught and handled gracefully
- Fallback messages are provided when services fail

## Troubleshooting

### Common Issues

1. **"API key not found" error**:
   - Make sure `.env` file exists and contains `EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY`
   - Restart your development server after adding the .env file

2. **"API not enabled" error**:
   - Ensure all three Google Cloud APIs are enabled in your project
   - Wait a few minutes after enabling APIs for them to become active

3. **"Permission denied" error**:
   - Check that your API key has the correct permissions
   - Verify API key restrictions aren't blocking the requests

4. **Audio not playing**:
   - Check device volume and audio permissions
   - Ensure the app has microphone permissions for recording 