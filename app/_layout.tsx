import '../global.css';

import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'royalblue',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Translate',
          headerTitle: 'Google Translate',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="language" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerTitle: 'Learning Progress',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="chart-line" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
