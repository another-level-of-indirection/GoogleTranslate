import { FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import AudioRecording from '~/components/AudioRecording';
import { audioToText, translate } from '~/utils/translation';
import wordsData from '~/words.json';

interface FlashCard {
  thai: string;
  english: string;
}

interface SessionStats {
  correct: number;
  incorrect: number;
  total: number;
}

export default function FlashcardsScreen() {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTranslation, setUserTranslation] = useState('');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [translationCorrect, setTranslationCorrect] = useState<boolean | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string>('');
  const [sessionStats, setSessionStats] = useState<SessionStats>({ correct: 0, incorrect: 0, total: 0 });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({
    numberOfCards: 10,
    repetitions: 1,
  });
  const [currentRepetition, setCurrentRepetition] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize flashcards from words.json
  useEffect(() => {
    const loadFlashcards = () => {
      const cards: FlashCard[] = [];

      Object.entries(wordsData).forEach(([thai, translations]) => {
        // Only include words that have non-empty English translations
        if (Array.isArray(translations) && translations[0] && translations[0].trim() !== '') {
          cards.push({
            thai,
            english: translations[0], // Use the first translation
          });
        }
      });

      // Shuffle the cards
      const shuffled = cards.sort(() => Math.random() - 0.5);
      setFlashcards(shuffled);
    };

    loadFlashcards();
  }, []);

  const startSession = () => {
    if (flashcards.length === 0) {
      Alert.alert('Error', 'No flashcards available');
      return;
    }

    // Reset session state
    setCurrentIndex(0);
    setCurrentRepetition(1);
    setUserTranslation('');
    setShowCorrectAnswer(false);
    setTranslationCorrect(null);
    setPronunciationFeedback('');
    setSessionStats({ correct: 0, incorrect: 0, total: 0 });
    setSessionStarted(true);

    // Limit flashcards to the specified number
    const limitedCards = flashcards.slice(0, sessionSettings.numberOfCards);
    setFlashcards(limitedCards);
  };

  const checkTranslation = () => {
    const currentCard = flashcards[currentIndex];
    if (!currentCard) return;

    const userAnswer = userTranslation.trim().toLowerCase();
    const correctAnswer = currentCard.english.toLowerCase();

    // Check if the user's answer matches the correct answer (case-insensitive)
    const isCorrect = userAnswer === correctAnswer ||
                     correctAnswer.includes(userAnswer) ||
                     userAnswer.includes(correctAnswer.split('/')[0]?.trim() || '');

    setTranslationCorrect(isCorrect);
    setShowCorrectAnswer(true);

    if (!isCorrect) {
      setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, total: prev.total + 1 }));
    }
  };

  const checkPronunciation = async (audioUri: string) => {
    if (!audioUri) return;

    setIsLoading(true);
    setPronunciationFeedback('Checking pronunciation...');

    try {
      const currentCard = flashcards[currentIndex];
      if (!currentCard) return;

      // Convert speech to text
      const spokenText = await audioToText(audioUri, 'Thai');

      if (!spokenText) {
        setPronunciationFeedback('Could not understand pronunciation. Please try again.');
        setIsLoading(false);
        return;
      }

      // Translate the spoken Thai to English
      const translatedText = await translate(spokenText, 'Thai', 'English');

      if (!translatedText) {
        setPronunciationFeedback('Could not translate pronunciation. Please try again.');
        setIsLoading(false);
        return;
      }

      // Compare with the expected translation
      const expectedTranslation = currentCard.english.toLowerCase();
      const actualTranslation = translatedText.toLowerCase();

      const pronunciationCorrect =
        actualTranslation.includes(expectedTranslation.split('/')[0]?.trim() || '') ||
        expectedTranslation.includes(actualTranslation) ||
        actualTranslation === expectedTranslation;

      if (pronunciationCorrect) {
        setPronunciationFeedback('Correct! 🎉');
        setSessionStats(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));

        // Auto-advance after a short delay
        setTimeout(() => {
          nextCard();
        }, 1500);
      } else {
        setPronunciationFeedback(`Incorrect! You said: "${spokenText}" (${translatedText}). Try again.`);
        setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, total: prev.total + 1 }));
      }
    } catch (error) {
      console.error('Pronunciation check error:', error);
      setPronunciationFeedback('Error checking pronunciation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (currentRepetition < sessionSettings.repetitions) {
      // Start next repetition
      setCurrentRepetition(prev => prev + 1);
      setCurrentIndex(0);
    } else {
      // Session complete
      endSession();
      return;
    }

    // Reset card state
    setUserTranslation('');
    setShowCorrectAnswer(false);
    setTranslationCorrect(null);
    setPronunciationFeedback('');
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      // Reset card state
      setUserTranslation('');
      setShowCorrectAnswer(false);
      setTranslationCorrect(null);
      setPronunciationFeedback('');
    }
  };

  const endSession = () => {
    const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

    Alert.alert(
      'Session Complete! 🎉',
      `Results:\n• Correct: ${sessionStats.correct}\n• Incorrect: ${sessionStats.incorrect}\n• Accuracy: ${accuracy}%`,
      [
        { text: 'Start New Session', onPress: () => setSessionStarted(false) },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const currentCard = flashcards[currentIndex];

  if (!sessionStarted) {
    return (
      <ScrollView className="flex-1 p-4 bg-white">
        <View className="items-center mb-6">
          <FontAwesome5 name="clone" size={64} color="royalblue" />
          <Text className="text-2xl font-bold mt-4 text-center">Thai Flashcards</Text>
          <Text className="text-gray-600 text-center mt-2">
            Learn Thai words through translation and pronunciation practice
          </Text>
        </View>

        <View className="bg-blue-50 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold mb-4">Session Settings</Text>

          <View className="mb-4">
            <Text className="font-medium mb-2">Number of flashcards:</Text>
            <View className="flex-row gap-2">
              {[5, 10, 15, 20].map(num => (
                <TouchableOpacity
                  key={num}
                  onPress={() => setSessionSettings(prev => ({ ...prev, numberOfCards: num }))}
                  className={`px-4 py-2 rounded ${
                    sessionSettings.numberOfCards === num ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <Text className={`${
                    sessionSettings.numberOfCards === num ? 'text-white' : 'text-gray-700'
                  }`}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2">Repetitions per session:</Text>
            <View className="flex-row gap-2">
              {[1, 2, 3].map(num => (
                <TouchableOpacity
                  key={num}
                  onPress={() => setSessionSettings(prev => ({ ...prev, repetitions: num }))}
                  className={`px-4 py-2 rounded ${
                    sessionSettings.repetitions === num ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <Text className={`${
                    sessionSettings.repetitions === num ? 'text-white' : 'text-gray-700'
                  }`}>
                    {num}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <Text className="font-semibold mb-2">How it works:</Text>
          <Text className="text-gray-700 mb-2">1. See a Thai word and write its English translation</Text>
          <Text className="text-gray-700 mb-2">2. Check your answer and see the correct translation</Text>
          <Text className="text-gray-700 mb-2">3. Practice pronunciation by recording yourself</Text>
          <Text className="text-gray-700">4. Get feedback on your pronunciation accuracy</Text>
        </View>

        <TouchableOpacity
          onPress={startSession}
          className="bg-blue-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Start Learning Session
          </Text>
        </TouchableOpacity>

        <View className="mt-4 p-4 bg-green-50 rounded-lg">
          <Text className="text-green-800 text-center">
            📚 {flashcards.length} words available for practice
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (!currentCard) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-600">No flashcards available</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      {/* Progress Header */}
      <View className="bg-blue-50 p-4 rounded-lg mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="font-semibold">
            Card {currentIndex + 1} of {flashcards.length}
          </Text>
          <Text className="font-semibold">
            Round {currentRepetition} of {sessionSettings.repetitions}
          </Text>
        </View>
        <View className="bg-blue-200 h-2 rounded-full">
          <View
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-around bg-gray-50 p-4 rounded-lg mb-4">
        <View className="items-center">
          <Text className="text-2xl font-bold text-green-600">{sessionStats.correct}</Text>
          <Text className="text-sm text-gray-600">Correct</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</Text>
          <Text className="text-sm text-gray-600">Incorrect</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-blue-600">
            {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%
          </Text>
          <Text className="text-sm text-gray-600">Accuracy</Text>
        </View>
      </View>

      {/* Flashcard */}
      <View className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-4 min-h-48 justify-center items-center">
        <Text className="text-4xl font-bold text-center mb-4">{currentCard.thai}</Text>

        {!showCorrectAnswer ? (
          <View className="w-full">
            <Text className="text-lg mb-2 text-center">What does this mean in English?</Text>
            <TextInput
              value={userTranslation}
              onChangeText={setUserTranslation}
              placeholder="Enter English translation..."
              className="border border-gray-300 p-3 rounded-lg text-lg mb-4"
              multiline
            />
            <TouchableOpacity
              onPress={checkTranslation}
              disabled={!userTranslation.trim()}
              className={`p-3 rounded-lg ${
                userTranslation.trim() ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <Text className={`text-center font-semibold ${
                userTranslation.trim() ? 'text-white' : 'text-gray-500'
              }`}>
                Check Translation
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="w-full">
            <View className={`p-3 rounded-lg mb-4 ${
              translationCorrect ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Text className={`text-center font-semibold ${
                translationCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {translationCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </Text>
              {!translationCorrect && (
                <Text className="text-center mt-2">
                  Your answer: "{userTranslation}"
                </Text>
              )}
              <Text className="text-center mt-2 font-medium">
                Correct answer: "{currentCard.english}"
              </Text>
            </View>

            <Text className="text-lg mb-3 text-center font-medium">
              Now practice pronunciation:
            </Text>

            <View className="items-center mb-4">
              <AudioRecording
                onNewRecording={checkPronunciation}
              />
              {isLoading && (
                <Text className="text-blue-600 mt-2">Processing...</Text>
              )}
            </View>

            {pronunciationFeedback && (
              <View className={`p-3 rounded-lg mb-4 ${
                pronunciationFeedback.includes('Correct') ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <Text className={`text-center ${
                  pronunciationFeedback.includes('Correct') ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {pronunciationFeedback}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Navigation */}
      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={previousCard}
          disabled={currentIndex === 0}
          className={`flex-1 p-3 rounded-lg mr-2 ${
            currentIndex === 0 ? 'bg-gray-200' : 'bg-gray-500'
          }`}
        >
          <Text className={`text-center font-semibold ${
            currentIndex === 0 ? 'text-gray-400' : 'text-white'
          }`}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={nextCard}
          className="flex-1 p-3 rounded-lg ml-2 bg-blue-500"
        >
          <Text className="text-white text-center font-semibold">
            {currentIndex === flashcards.length - 1 && currentRepetition === sessionSettings.repetitions
              ? 'Finish Session'
              : 'Next →'
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* End Session Button */}
      <TouchableOpacity
        onPress={endSession}
        className="mt-4 p-3 rounded-lg bg-red-500"
      >
        <Text className="text-white text-center font-semibold">End Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
