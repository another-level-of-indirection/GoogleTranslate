import { FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { database } from '~/utils/database';

interface LearningSession {
  id: number;
  word: string;
  translation: string;
  correct: boolean;
  timestamp: string;
}

interface WordStats {
  word: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number;
  last_practiced: string;
}

export default function ProgressScreen() {
  const [db, setDb] = useState<any>(null);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [wordStats, setWordStats] = useState<WordStats[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isWebPlatform] = useState(Platform.OS === 'web');

  // Initialize database
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const dbInstance = await database.openDatabase();
        setDb(dbInstance);

        // Create tables if they don't exist (no-op for AsyncStorage)
        await database.execAsync(dbInstance, `
          CREATE TABLE IF NOT EXISTS learning_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            translation TEXT NOT NULL,
            correct BOOLEAN NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_word ON learning_sessions(word);
          CREATE INDEX IF NOT EXISTS idx_timestamp ON learning_sessions(timestamp);
        `);

        console.log('Database initialized successfully');
        await loadData(dbInstance);
      } catch (error) {
        console.error('Database initialization error:', error);
        Alert.alert('Database Error', 'Failed to initialize database');
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []);

  // Load data from database
  const loadData = async (dbInstance: any) => {
    try {
      // Load recent sessions
      const sessionsResult = await database.getAllAsync(
        dbInstance,
        'SELECT * FROM learning_sessions ORDER BY timestamp DESC LIMIT 20'
      ) as LearningSession[];
      setSessions(sessionsResult);

      // Load word statistics
      const statsResult = await database.getAllAsync(dbInstance, `
        SELECT
          word,
          COUNT(*) as total_attempts,
          SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
          ROUND(
            (SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1
          ) as accuracy,
          MAX(timestamp) as last_practiced
        FROM learning_sessions
        GROUP BY word
        ORDER BY last_practiced DESC
      `) as WordStats[];
      setWordStats(statsResult);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  // Add a new learning session
  const addLearningSession = async (word: string, translation: string, correct: boolean) => {
    if (!db) return;

    try {
      await database.runAsync(
        db,
        'INSERT INTO learning_sessions (word, translation, correct) VALUES (?, ?, ?)',
        [word, translation, correct]
      );
      await loadData(db);
    } catch (error) {
      console.error('Error adding session:', error);
      Alert.alert('Error', 'Failed to save learning session');
    }
  };

  // Add sample data for testing
  const addSampleData = async () => {
    const sampleWords = [
      { word: 'สวัสดี', translation: 'Hello', correct: true },
      { word: 'ขอบคุณ', translation: 'Thank you', correct: true },
      { word: 'สวัสดี', translation: 'Hello', correct: false },
      { word: 'ลาก่อน', translation: 'Goodbye', correct: true },
      { word: 'ขอบคุณ', translation: 'Thank you', correct: true },
    ];

    try {
      for (const item of sampleWords) {
        await addLearningSession(item.word, item.translation, item.correct);
      }
      Alert.alert('Success', 'Sample data added successfully!');
    } catch (error) {
      console.error('Error adding sample data:', error);
      Alert.alert('Error', 'Failed to add sample data');
    }
  };

  // Clear all data
  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all learning progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!db) return;
              await database.runAsync(db, 'DELETE FROM learning_sessions');
              await loadData(db);
              Alert.alert('Success', 'All data cleared successfully!');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  // Add custom word
  const addCustomWord = async () => {
    if (!newWord.trim() || !newTranslation.trim()) {
      Alert.alert('Error', 'Please enter both word and translation');
      return;
    }

    // Simulate a practice session (randomly correct/incorrect for demo)
    const correct = Math.random() > 0.3; // 70% chance of being correct
    await addLearningSession(newWord.trim(), newTranslation.trim(), correct);
    setNewWord('');
    setNewTranslation('');
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading database...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      {/* Platform Info */}
      {isWebPlatform && (
        <View className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
          <Text className="text-blue-800 text-sm">
            💾 Running on web platform - using AsyncStorage for persistent data
          </Text>
        </View>
      )}

      {/* Header Stats */}
      <View className="bg-blue-50 p-4 rounded-lg mb-4">
        <Text className="text-lg font-bold text-center mb-2">Learning Statistics</Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">{sessions.length}</Text>
            <Text className="text-sm text-gray-600">Total Sessions</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">{wordStats.length}</Text>
            <Text className="text-sm text-gray-600">Words Practiced</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-purple-600">
              {wordStats.length > 0
                ? Math.round(wordStats.reduce((sum, stat) => sum + stat.accuracy, 0) / wordStats.length)
                : 0}%
            </Text>
            <Text className="text-sm text-gray-600">Avg Accuracy</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          onPress={addSampleData}
          className="flex-1 bg-blue-500 p-3 rounded-lg">
          <Text className="text-white text-center font-semibold">Add Sample Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={clearAllData}
          className="flex-1 bg-red-500 p-3 rounded-lg">
          <Text className="text-white text-center font-semibold">Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* Add Custom Word */}
      <View className="bg-gray-50 p-4 rounded-lg mb-4">
        <Text className="font-semibold mb-2">Practice New Word</Text>
        <View className="gap-2">
          <TextInput
            value={newWord}
            onChangeText={setNewWord}
            placeholder="Enter Thai word (e.g., สวัสดี)"
            className="border border-gray-300 p-2 rounded"
          />
          <TextInput
            value={newTranslation}
            onChangeText={setNewTranslation}
            placeholder="Enter English translation (e.g., Hello)"
            className="border border-gray-300 p-2 rounded"
          />
          <TouchableOpacity
            onPress={addCustomWord}
            className="bg-green-500 p-2 rounded">
            <Text className="text-white text-center font-semibold">Practice Word</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Word Statistics */}
      {wordStats.length > 0 && (
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Word Statistics</Text>
          <FlatList
            data={wordStats}
            keyExtractor={(item) => item.word}
            renderItem={({ item }) => (
              <View className="bg-gray-50 p-3 rounded-lg mb-2">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-semibold text-lg">{item.word}</Text>
                    <Text className="text-gray-600">
                      {item.correct_attempts}/{item.total_attempts} correct ({item.accuracy}%)
                    </Text>
                  </View>
                  <View className="items-center">
                    <FontAwesome5
                      name={item.accuracy >= 80 ? 'star' : item.accuracy >= 60 ? 'star-half-alt' : 'star'}
                      size={20}
                      color={item.accuracy >= 80 ? 'gold' : item.accuracy >= 60 ? 'orange' : 'gray'}
                      solid={item.accuracy >= 80}
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      {new Date(item.last_practiced).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            style={{ maxHeight: 200 }}
          />
        </View>
      )}

      {/* Recent Sessions */}
      <View className="flex-1">
        <Text className="text-lg font-bold mb-2">Recent Practice Sessions</Text>
        {sessions.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <FontAwesome5 name="book-open" size={48} color="gray" />
            <Text className="text-gray-500 mt-2">No practice sessions yet</Text>
            <Text className="text-gray-400 text-center mt-1">
              Add some sample data or practice a word to get started!
            </Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="bg-white border border-gray-200 p-3 rounded-lg mb-2">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-semibold">{item.word}</Text>
                    <Text className="text-gray-600">{item.translation}</Text>
                  </View>
                  <View className="items-center">
                    <FontAwesome5
                      name={item.correct ? 'check-circle' : 'times-circle'}
                      size={20}
                      color={item.correct ? 'green' : 'red'}
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
