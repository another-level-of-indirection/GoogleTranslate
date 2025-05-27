import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Platform-specific database interface
export interface DatabaseInterface {
  openDatabase: () => Promise<any>;
  execAsync: (db: any, sql: string) => Promise<void>;
  getAllAsync: (db: any, sql: string) => Promise<any[]>;
  runAsync: (db: any, sql: string, params?: any[]) => Promise<void>;
}

// AsyncStorage-based database for web platform
const asyncStorageDatabase: DatabaseInterface = {
  openDatabase: async () => ({ type: 'asyncstorage' }),

  execAsync: async () => {
    // For CREATE TABLE operations, we don't need to do anything
    // as AsyncStorage doesn't require schema creation
  },

  getAllAsync: async (db: any, sql: string) => {
    try {
      // Parse the SQL to determine what data to retrieve
      if (sql.includes('learning_sessions ORDER BY timestamp DESC')) {
        const sessionsData = await AsyncStorage.getItem('learning_sessions');
        const sessions = sessionsData ? JSON.parse(sessionsData) : [];
        // Sort by timestamp descending and limit to 20
        return sessions
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 20);
      }

      if (sql.includes('GROUP BY word')) {
        // Calculate word statistics
        const sessionsData = await AsyncStorage.getItem('learning_sessions');
        const sessions = sessionsData ? JSON.parse(sessionsData) : [];

        const wordStats = sessions.reduce((acc: any, session: any) => {
          if (!acc[session.word]) {
            acc[session.word] = {
              word: session.word,
              total_attempts: 0,
              correct_attempts: 0,
              last_practiced: session.timestamp,
            };
          }

          acc[session.word].total_attempts += 1;
          if (session.correct) {
            acc[session.word].correct_attempts += 1;
          }

          // Update last practiced if this session is more recent
          if (new Date(session.timestamp) > new Date(acc[session.word].last_practiced)) {
            acc[session.word].last_practiced = session.timestamp;
          }

          return acc;
        }, {});

        // Calculate accuracy and convert to array
        return Object.values(wordStats).map((stat: any) => ({
          ...stat,
          accuracy: Math.round((stat.correct_attempts / stat.total_attempts) * 100 * 10) / 10,
        })).sort((a: any, b: any) => new Date(b.last_practiced).getTime() - new Date(a.last_practiced).getTime());
      }

      return [];
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return [];
    }
  },

  runAsync: async (db: any, sql: string, params?: any[]) => {
    try {
      if (sql.includes('INSERT INTO learning_sessions')) {
        // Add new learning session
        const [word, translation, correct] = params || [];
        const sessionsData = await AsyncStorage.getItem('learning_sessions');
        const sessions = sessionsData ? JSON.parse(sessionsData) : [];

        const newSession = {
          id: Date.now(),
          word,
          translation,
          correct,
          timestamp: new Date().toISOString(),
        };

        sessions.push(newSession);
        await AsyncStorage.setItem('learning_sessions', JSON.stringify(sessions));
      }

      if (sql.includes('DELETE FROM learning_sessions')) {
        // Clear all sessions
        await AsyncStorage.removeItem('learning_sessions');
      }
    } catch (error) {
      console.error('Error writing to AsyncStorage:', error);
      throw error;
    }
  },
};

// Native database for mobile platforms
let nativeDatabase: DatabaseInterface | null = null;

if (Platform.OS !== 'web') {
  try {
    // Dynamic import only on native platforms
    const SQLite = require('expo-sqlite');
    nativeDatabase = {
      openDatabase: () => SQLite.openDatabaseAsync('learning_progress.db'),
      execAsync: (db: any, sql: string) => db.execAsync(sql),
      getAllAsync: (db: any, sql: string) => db.getAllAsync(sql),
      runAsync: (db: any, sql: string, params?: any[]) => db.runAsync(sql, params),
    };
  } catch (error) {
    console.warn('SQLite not available:', error);
  }
}

export const database = Platform.OS === 'web' ? asyncStorageDatabase : (nativeDatabase || asyncStorageDatabase);
