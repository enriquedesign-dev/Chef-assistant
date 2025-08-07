import '../global.css';
import { Stack, SplashScreen } from 'expo-router';
import { SupabaseProvider } from '~/context/SupabaseContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { useEffect } from 'react';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="debug" options={{ headerShown: false }} />
          <Stack.Screen name="details" options={{ headerShown: false }} />

          {/* Onboarding screens */}
          <Stack.Screen name="onboarding/ingredients" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/tastes" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/utensils" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/recipes" options={{ headerShown: false }} />

          {/* Recipe screens */}
          <Stack.Screen name="recipe-detail" options={{ headerShown: false }} />
          <Stack.Screen name="saved-recipe-detail" options={{ headerShown: false }} />
          <Stack.Screen name="create-recipe" options={{ headerShown: false }} />
        </Stack>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}
