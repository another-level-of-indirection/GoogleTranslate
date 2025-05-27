# Speech Recognition Troubleshooting

## Current Issues and Solutions

### 1. Google Cloud Speech API 400 Errors

**Problem**: The Speech-to-Text API returns 400 Bad Request errors.

**Root Cause**: Audio format compatibility issues between web browsers and Google Cloud Speech API.

**Solutions Applied**:
- ✅ Updated audio recording to use OGG/Opus format for web
- ✅ Added intelligent fallback configurations
- ✅ Platform-specific audio encoding detection
- ✅ Enhanced error logging

### 2. Recognition Delays

**Problem**: Speech recognition takes several seconds to process.

**Causes**:
- Network latency to Google Cloud APIs
- Audio encoding/decoding time
- Multiple configuration attempts (fallback system)

**Optimizations**:
- Use shorter audio samples (2-5 seconds)
- Ensure stable internet connection
- Consider implementing server-side processing for production use

### 3. React "Unexpected text node" Warning

**Problem**: Console shows "A text node cannot be a child of a <View>" error.

**Solution**: ✅ Fixed string concatenation in `EditScreenInfo.tsx` component.

## Debugging Steps

### Check Audio Format
1. Open browser console
2. Record audio and check logs for:
   ```
   Processing audio file: [URI]
   Audio base64 length: [number]
   Trying speech config 1/3: [config object]
   ```

### Verify API Configuration
1. Check that all three Google Cloud APIs are enabled:
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
   - Cloud Translation API

2. Verify API key permissions in Google Cloud Console

### Test Audio Quality
1. Record in a quiet environment
2. Speak clearly and at normal pace
3. Keep recordings between 2-5 seconds
4. Avoid background noise

## Platform-Specific Issues

### Web Browsers
- **Chrome**: Best compatibility with OGG/Opus
- **Firefox**: Good Opus support
- **Safari**: May have limited codec support

**Recommended**: Use Chrome for best results during development.

### Mobile Devices
- **iOS**: Uses M4A/AAC format (well supported)
- **Android**: Uses M4A/AAC format (well supported)

## Configuration Details

### Current Audio Settings

**Web (OGG/Opus)**:
```javascript
{
  mimeType: 'audio/ogg;codecs=opus',
  bitsPerSecond: 48000,
}
```

**Mobile (M4A/AAC)**:
```javascript
{
  extension: '.m4a',
  outputFormat: Audio.AndroidOutputFormat.MPEG_4,
  audioEncoder: Audio.AndroidAudioEncoder.AAC,
  sampleRate: 44100,
  numberOfChannels: 2,
  bitRate: 128000,
}
```

### Google Cloud Speech Configurations

The app tries configurations in this order:

1. **OGG_OPUS** (48kHz) - Web optimized
2. **WEBM_OPUS** (48kHz) - Web fallback
3. **MP4** (44.1kHz) - Mobile optimized
4. **Auto-detect** - Universal fallback

## Performance Tips

### Reduce Latency
1. **Use shorter recordings**: 2-3 seconds optimal
2. **Stable connection**: Ensure good internet speed
3. **Server-side processing**: Consider implementing a server-side proxy for production

### Improve Accuracy
1. **Clear speech**: Speak distinctly
2. **Quiet environment**: Minimize background noise
3. **Proper distance**: 6-12 inches from microphone
4. **Language setting**: Ensure correct language is set

## Error Messages and Solutions

### "All speech recognition configurations failed"
- Check internet connection
- Verify Google Cloud API key
- Ensure Speech-to-Text API is enabled
- Try recording longer audio (3+ seconds)

### "API key not found"
- Verify `.env` file exists
- Check `EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY` is set
- Restart development server

### "Permission denied"
- Check microphone permissions in browser
- Verify API key has Speech-to-Text permissions
- Ensure API is enabled in Google Cloud Console

## Alternative Solutions

### If Speech Recognition Continues to Fail

1. **Implement server-side processing**: Create a backend service to handle API calls

2. **Use a different speech service** (requires additional setup):
   - Azure Speech Services
   - AWS Transcribe
   - Web Speech API (browser-native, limited accuracy)

3. **Implement retry logic** with exponential backoff

## Monitoring and Debugging

### Enable Detailed Logging
The app now includes detailed logging. Check console for:
- Audio file processing details
- Configuration attempts
- API response details
- Error messages with context

### Google Cloud Monitoring
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" → "Dashboard"
3. Monitor API usage and error rates
4. Check quotas and billing

## Contact and Support

If issues persist:
1. Check Google Cloud Status page
2. Review API quotas and limits
3. Test with different audio samples
4. Consider implementing server-side processing for better reliability 