# Setup Verification Guide

This guide helps you verify that your Google Cloud API integration is working correctly.

## Quick Setup Checklist

### 1. Environment Configuration
- [ ] Copy `env.example` to `.env`
- [ ] Add your Google Cloud API key to `.env`:
  ```env
  EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_actual_api_key_here
  ```
- [ ] Restart your development server

### 2. Google Cloud APIs Enabled
- [ ] Cloud Speech-to-Text API
- [ ] Cloud Text-to-Speech API  
- [ ] Cloud Translation API

### 3. API Key Permissions
- [ ] API key has access to all three services
- [ ] API key restrictions (if any) allow your domain/app

## Testing the Features

### Translation Test
1. Open the app
2. Type "Hello world" in the input field
3. Select "English" as source language
4. Select "Spanish" as target language
5. Tap the translate button
6. Expected result: "Hola mundo" or similar

### Text-to-Speech Test
1. After translating text
2. Tap the speaker icon in the output section
3. Expected result: Audio playback of the translated text

### Speech-to-Text Test
1. Tap the microphone icon
2. Say something clearly (e.g., "Hello, how are you?")
3. Tap the stop button
4. Expected result: Your speech appears in the input field and gets translated

## Troubleshooting Common Issues

### "API key not found" Error
```
Error: Google Cloud API key not found. Please set EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY in your .env file.
```
**Solution**: 
1. Ensure `.env` file exists in project root
2. Check the environment variable name is exactly `EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY`
3. Restart your development server

### "400 Bad Request" for Speech-to-Text
```
POST https://speech.googleapis.com/v1/speech:recognize?key=... 400 (Bad Request)
```
**Solution**: 
- The app now tries multiple audio configurations automatically
- If all fail, check your microphone permissions
- Try recording a longer audio sample (2-3 seconds minimum)

### "Permission denied" Error
```
Error: Google Cloud Translation API error: Forbidden
```
**Solution**:
1. Verify your API key is correct
2. Check that the Translation API is enabled in Google Cloud Console
3. Ensure API key has permission for the Translation API

### Audio Not Playing
**Solution**:
1. Check device volume
2. Ensure audio permissions are granted
3. Try on a different device/browser

### React "Unexpected text node" Warning
This is a development warning and doesn't affect functionality. It's related to React Native Web rendering.

## Configuration

The app uses direct Google Cloud API calls with your API key configured in the `.env` file. This provides:
- Simple setup process
- Direct communication with Google Cloud services
- Suitable for development and small-scale applications

## Performance Notes

- **First API call** may take 2-3 seconds (cold start)
- **Subsequent calls** should be faster
- **Large audio files** may take longer to process
- **Network connectivity** affects all operations

## Cost Monitoring

Monitor your Google Cloud usage:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "Billing" → "Reports"
3. Filter by the APIs you're using

Typical costs for testing:
- Translation: ~$0.02 per 1000 characters
- Speech-to-Text: ~$0.006 per 15 seconds
- Text-to-Speech: ~$0.004 per 1000 characters

## Success Indicators

✅ **Everything is working if:**
- Text translation works in both directions
- Audio playback works for translated text
- Speech recognition converts your voice to text
- No API key errors in console
- Reasonable response times (< 5 seconds)

## Getting Help

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Google Cloud Console settings
3. Test with simple, clear speech samples
4. Ensure stable internet connection 