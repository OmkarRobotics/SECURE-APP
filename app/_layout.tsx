// app/_layout.tsx (main layout file)
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="LessonDetail" 
        options={{ 
          headerShown: false,
          presentation: 'modal' // Optional: makes it slide up nicely
        }} 
      />
    </Stack>
  );
}