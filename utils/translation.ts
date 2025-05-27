import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { createAudioPlayer } from 'expo-audio';

import { languages } from '~/assets/languages';

const GOOGLE_CLOUD_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;

// Helper function to convert language name to language code
const getLanguageCode = (languageName: string): string => {
  const language = languages.find((lang) => lang.name === languageName);
  return language?.code || 'en'; // Default to English if not found
};

// Direct Google Cloud API calls
const directTranslate = async (input: string, fromCode: string, toCode: string) => {
  const requestBody = {
    q: input,
    source: fromCode,
    target: toCode,
    format: 'text',
  };

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
    throw new Error(`Google Cloud Translation API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data?.translations?.[0]?.translatedText || '';
};

const directTextToSpeech = async (text: string, voice: string, languageCode: string) => {
  const requestBody = {
    input: {
      text,
    },
    voice: {
      languageCode,
      name: voice,
    },
    audioConfig: {
      audioEncoding: 'MP3',
    },
  };

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Cloud Text-to-Speech API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.audioContent;
};

const directSpeechToText = async (audioBase64: string, languageCode: string = 'en-US') => {
  // Determine platform and use appropriate configuration
  const isWeb = Platform.OS === 'web';

  const configs = [
    {
      // Try ENCODING_UNSPECIFIED first - let Google auto-detect
      encoding: 'ENCODING_UNSPECIFIED',
      languageCode,
      enableAutomaticPunctuation: true,
    },
    // ...(isWeb ? [
    //   {
    //     // For web - try OGG Opus
    //     encoding: 'OGG_OPUS',
    //     sampleRateHertz: 48000,
    //     languageCode: 'en-US',
    //     enableAutomaticPunctuation: true,
    //   },
    //   {
    //     // For web - try WebM Opus
    //     encoding: 'WEBM_OPUS',
    //     sampleRateHertz: 48000,
    //     languageCode: 'en-US',
    //     enableAutomaticPunctuation: true,
    //   }
    // ] : [
    //   {
    //     // For mobile - try LINEAR16
    //     encoding: 'LINEAR16',
    //     sampleRateHertz: 44100,
    //     languageCode: 'en-US',
    //     enableAutomaticPunctuation: true,
    //   }
    // ]),
    // {
    //   // Final fallback - minimal config
    //   languageCode: 'en-US',
    //   enableAutomaticPunctuation: true,
    // }
  ];

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    try {
      console.log(`Trying speech config ${i + 1}/${configs.length}:`, config);

      const requestBody = {
        config,
        audio: {
          content: audioBase64,
        },
      };

      console.log('Full request body being sent to Google Cloud Speech API:', {
        config: requestBody.config,
        audioContentLength: audioBase64.length,
        audioPreview: audioBase64.substring(0, 50) + '...',
      });

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const transcript = result.results?.[0]?.alternatives?.[0]?.transcript || '';
        if (transcript) {
          console.log('Speech recognition successful with config:', config);
          return transcript;
        }
      } else {
        const errorText = await response.text();
        console.warn(`Config ${i + 1} failed:`, config, 'Error:', errorText);
      }
    } catch (error) {
      console.warn(`Config ${i + 1} failed:`, config, 'Error:', error);
    }
  }

  throw new Error(
    'All speech recognition configurations failed. Please check your audio format and API key.'
  );
};

export const translate = async (input: string, from: string, to: string) => {
  const fromCode = getLanguageCode(from);
  const toCode = getLanguageCode(to);

  try {
    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error(
        'Google Cloud API key not found. Please set EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY in your .env file.'
      );
    }
    return await directTranslate(input, fromCode, toCode);
  } catch (error) {
    console.error('Translation error:', error);
    return 'Translation failed. Please try again.';
  }
};

export const textToSpeech = async (text: string, languageName?: string) => {
  const languageCode = languageName ? getLanguageCode(languageName) : 'en-US';

  // Map language codes to appropriate voice names for Google Cloud TTS
  const getVoiceName = (langCode: string): string => {
    const voiceMap: { [key: string]: string } = {
      en: 'en-US-Standard-A',
      es: 'es-ES-Standard-A',
      fr: 'fr-FR-Standard-A',
      de: 'de-DE-Standard-A',
      it: 'it-IT-Standard-A',
      pt: 'pt-BR-Standard-A',
      zh: 'zh-CN-Standard-A',
      ja: 'ja-JP-Standard-A',
      ko: 'ko-KR-Standard-A',
      hi: 'hi-IN-Standard-A',
      ar: 'ar-XA-Standard-A',
      ru: 'ru-RU-Standard-A',
      th: 'th-TH-Standard-A',
    };
    return voiceMap[langCode] || 'en-US-Standard-A';
  };

  const voice = getVoiceName(languageCode);
  const fullLanguageCode =
    languageCode === 'en'
      ? 'en-US'
      : languageCode === 'es'
        ? 'es-ES'
        : languageCode === 'fr'
          ? 'fr-FR'
          : languageCode === 'de'
            ? 'de-DE'
            : languageCode === 'it'
              ? 'it-IT'
              : languageCode === 'pt'
                ? 'pt-BR'
                : languageCode === 'zh'
                  ? 'zh-CN'
                  : languageCode === 'ja'
                    ? 'ja-JP'
                    : languageCode === 'ko'
                      ? 'ko-KR'
                      : languageCode === 'hi'
                        ? 'hi-IN'
                        : languageCode === 'ar'
                          ? 'ar-XA'
                          : languageCode === 'ru'
                            ? 'ru-RU'
                            : languageCode === 'th'
                              ? 'th-TH'
                              : 'en-US';

  try {
    let mp3Base64: string;

    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error(
        'Google Cloud API key not found. Please set EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY in your .env file.'
      );
    }
    mp3Base64 = await directTextToSpeech(text, voice, fullLanguageCode);

    if (mp3Base64) {
      const player = createAudioPlayer({
        uri: `data:audio/mp3;base64,${mp3Base64}`,
      });
      player.play();
    }
  } catch (error) {
    console.error('Text-to-speech error:', error);
  }
};

export const audioToText = async (uri: string, languageName?: string) => {
  try {
    console.log('Processing audio file:', uri);
    console.log('Language name received:', languageName);
    const audioBase64 = await uriToBase64(uri);
    console.log('Audio base64 length:', audioBase64.length);
    console.log('Audio base64 preview:', audioBase64.substring(0, 100) + '...');

    // Convert language name to language code for speech recognition
    const languageCode = languageName ? getLanguageCode(languageName) : 'en';
    const fullLanguageCode =
      languageCode === 'en'
        ? 'en-US'
        : languageCode === 'es'
          ? 'es-ES'
          : languageCode === 'fr'
            ? 'fr-FR'
            : languageCode === 'de'
              ? 'de-DE'
              : languageCode === 'it'
                ? 'it-IT'
                : languageCode === 'pt'
                  ? 'pt-BR'
                  : languageCode === 'zh'
                    ? 'zh-CN'
                    : languageCode === 'ja'
                      ? 'ja-JP'
                      : languageCode === 'ko'
                        ? 'ko-KR'
                        : languageCode === 'hi'
                          ? 'hi-IN'
                          : languageCode === 'ar'
                            ? 'ar-XA'
                            : languageCode === 'ru'
                              ? 'ru-RU'
                              : languageCode === 'th'
                                ? 'th-TH'
                                : 'en-US';

    console.log('Language conversion:', {
      languageName,
      languageCode,
      fullLanguageCode,
    });

    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error(
        'Google Cloud API key not found. Please set EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY in your .env file.'
      );
    }
    return await directSpeechToText(audioBase64, fullLanguageCode);
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return 'Speech recognition failed. Please try again.';
  }
};

const uriToBase64 = async (uri: string) => {
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    const blob = await res.blob();
    const base64: string = await convertBlobToBase64(blob);
    return base64.split('base64,')[1];
  } else {
    return FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  }
};

const convertBlobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
