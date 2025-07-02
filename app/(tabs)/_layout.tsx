import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs initialRouteName="home">
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="lessons" options={{ title: 'Lessons' }} />
      <Tabs.Screen name="questions" options={{ title: 'Questions' }} />
    </Tabs>
  );
}
