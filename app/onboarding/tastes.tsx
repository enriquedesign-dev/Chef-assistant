import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '~/utils/supabase';
import { Container } from '~/components/Container';

interface UserPreferences {
  diets: string[];
  tastes: string[];
  preferred_difficulty: string;
  preferred_time_minutes: number;
  preferred_portions: number;
}

// Load preferences from database on component mount
const loadPreferences = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data && !error) {
      setPreferences({
        diets: data.diet ? data.diet.split(',').filter(Boolean) : [],
        tastes: data.tastes || [],
        preferred_difficulty: data.preferred_difficulty || '',
        preferred_time_minutes: data.preferred_time_minutes || 30,
        preferred_portions: data.preferred_portions || 2,
      });
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }
};

const DIET_OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
];
const TASTE_OPTIONS = [
  'Italian',
  'Mexican',
  'Asian',
  'Mediterranean',
  'Indian',
  'American',
  'French',
  'Thai',
];
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];
const TIME_OPTIONS = [15, 30, 45, 60, 90, 120];
const PORTION_OPTIONS = [1, 2, 4, 6, 8];

export default function OnboardingTastes() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    diets: [],
    tastes: [],
    preferred_difficulty: '',
    preferred_time_minutes: 30,
    preferred_portions: 2,
  });

  const [customDiet, setCustomDiet] = useState('');
  const [customCuisine, setCustomCuisine] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const toggleDiet = (diet: string) => {
    setPreferences((prev) => ({
      ...prev,
      diets: prev.diets.includes(diet)
        ? prev.diets.filter((d) => d !== diet)
        : [...prev.diets, diet],
    }));
  };

  const addCustomDiet = () => {
    if (customDiet.trim() && !preferences.diets.includes(customDiet.trim())) {
      setPreferences((prev) => ({
        ...prev,
        diets: [...prev.diets, customDiet.trim()],
      }));
      setCustomDiet('');
    }
  };

  const removeCustomDiet = (diet: string) => {
    setPreferences((prev) => ({
      ...prev,
      diets: prev.diets.filter((d) => d !== diet),
    }));
  };

  const addCustomCuisine = () => {
    if (customCuisine.trim() && !preferences.tastes.includes(customCuisine.trim())) {
      setPreferences((prev) => ({
        ...prev,
        tastes: [...prev.tastes, customCuisine.trim()],
      }));
      setCustomCuisine('');
    }
  };

  const removeCustomCuisine = (cuisine: string) => {
    setPreferences((prev) => ({
      ...prev,
      tastes: prev.tastes.filter((t) => t !== cuisine),
    }));
  };

  const toggleTaste = (taste: string) => {
    setPreferences((prev) => ({
      ...prev,
      tastes: prev.tastes.includes(taste)
        ? prev.tastes.filter((t) => t !== taste)
        : [...prev.tastes, taste],
    }));
  };

  const isFormValid = () => {
    return (
      preferences.diets.length > 0 &&
      preferences.tastes.length > 0 &&
      preferences.preferred_difficulty
    );
  };

  const handleComplete = async () => {
    if (!isFormValid()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Save preferences
      const { error: prefError } = await supabase.from('user_preferences').upsert({
        id: user.id,
        diet: preferences.diets.join(','),
        tastes: preferences.tastes,
        preferred_difficulty: preferences.preferred_difficulty,
        preferred_time_minutes: preferences.preferred_time_minutes,
        preferred_portions: preferences.preferred_portions,
      });

      if (prefError) throw prefError;

      // Navigate to recipe generation
      router.push('/onboarding/recipes');
    } catch {
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Tastes', headerShown: false }} />
      <View className="flex-1 bg-cream-50">
        <View className="mb-8 flex-row items-center px-6 pb-4 pt-12">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-2xl text-earth-600">
              ←
            </Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-2xl text-earth-800">
            Preferences
          </Text>
        </View>

        <ScrollView className="flex-1 px-6">
          <View className="mb-6">
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="mb-3 text-lg text-earth-800">
              Diet
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {DIET_OPTIONS.map((diet) => (
                <TouchableOpacity
                  key={diet}
                  onPress={() => toggleDiet(diet)}
                  className={`rounded-full border-2 px-4 py-2 ${
                    preferences.diets.includes(diet)
                      ? 'border-earth-600 bg-earth-600'
                      : 'border-earth-300 bg-cream-50'
                  }`}>
                  <Text
                    style={{ fontFamily: 'Nunito_500Medium' }}
                    className={`${
                      preferences.diets.includes(diet) ? 'text-cream-50' : 'text-earth-700'
                    }`}>
                    {diet}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Custom diets */}
              {preferences.diets
                .filter((diet) => !DIET_OPTIONS.includes(diet))
                .map((customDietItem) => (
                  <TouchableOpacity
                    key={`custom-${customDietItem}`}
                    onPress={() => toggleDiet(customDietItem)}
                    className={`flex-row items-center rounded-full border-2 px-4 py-2 ${
                      preferences.diets.includes(customDietItem)
                        ? 'border-earth-600 bg-earth-600'
                        : 'border-earth-300 bg-cream-50'
                    }`}>
                    <Text
                      style={{ fontFamily: 'Nunito_500Medium' }}
                      className={`${
                        preferences.diets.includes(customDietItem)
                          ? 'text-cream-50'
                          : 'text-earth-700'
                      }`}>
                      {customDietItem}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        removeCustomDiet(customDietItem);
                      }}
                      className="ml-2 h-5 w-5 items-center justify-center">
                      <Text
                        style={{ fontFamily: 'Nunito_600SemiBold' }}
                        className={`${
                          preferences.diets.includes(customDietItem)
                            ? 'text-cream-50'
                            : 'text-earth-700'
                        }`}>
                        ×
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
            </View>

            {/* Custom diet input */}
            <View className="mt-3 flex-row space-x-2">
              <TextInput
                className="flex-1 rounded-lg border border-earth-300 bg-cream-50 px-4 py-2 font-sans"
                value={customDiet}
                onChangeText={setCustomDiet}
                placeholder="Add custom diet"
                placeholderTextColor="#9ca3af"
                onSubmitEditing={addCustomDiet}
              />
              <TouchableOpacity
                onPress={addCustomDiet}
                disabled={!customDiet.trim()}
                className={`rounded-lg px-4 py-2 ${
                  customDiet.trim() ? 'bg-earth-600' : 'bg-gray-400'
                }`}>
                <Text
                  style={{ fontFamily: 'Nunito_600SemiBold' }}
                  className={`${customDiet.trim() ? 'text-cream-50' : 'text-gray-200'}`}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="mb-3 text-lg text-earth-800">
              Preferred Cuisines
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {TASTE_OPTIONS.map((taste) => (
                <TouchableOpacity
                  key={taste}
                  onPress={() => toggleTaste(taste)}
                  className={`rounded-full border-2 px-4 py-2 ${
                    preferences.tastes.includes(taste)
                      ? 'border-earth-600 bg-earth-600'
                      : 'border-earth-300 bg-cream-50'
                  }`}>
                  <Text
                    style={{ fontFamily: 'Nunito_500Medium' }}
                    className={`${
                      preferences.tastes.includes(taste) ? 'text-cream-50' : 'text-earth-700'
                    }`}>
                    {taste}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Custom cuisines */}
              {preferences.tastes
                .filter((taste) => !TASTE_OPTIONS.includes(taste))
                .map((customCuisineItem) => (
                  <TouchableOpacity
                    key={`custom-${customCuisineItem}`}
                    onPress={() => toggleTaste(customCuisineItem)}
                    className={`flex-row items-center rounded-full border-2 px-4 py-2 ${
                      preferences.tastes.includes(customCuisineItem)
                        ? 'border-earth-600 bg-earth-600'
                        : 'border-earth-300 bg-cream-50'
                    }`}>
                    <Text
                      style={{ fontFamily: 'Nunito_500Medium' }}
                      className={`${
                        preferences.tastes.includes(customCuisineItem)
                          ? 'text-cream-50'
                          : 'text-earth-700'
                      }`}>
                      {customCuisineItem}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        removeCustomCuisine(customCuisineItem);
                      }}
                      className="ml-2 h-5 w-5 items-center justify-center">
                      <Text
                        style={{ fontFamily: 'Nunito_600SemiBold' }}
                        className={`${
                          preferences.tastes.includes(customCuisineItem)
                            ? 'text-cream-50'
                            : 'text-earth-700'
                        }`}>
                        ×
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
            </View>

            {/* Custom cuisine input */}
            <View className="mt-3 flex-row space-x-2">
              <TextInput
                className="flex-1 rounded-lg border border-earth-300 bg-cream-50 px-4 py-2 font-sans"
                value={customCuisine}
                onChangeText={setCustomCuisine}
                placeholder="Add custom cuisine"
                placeholderTextColor="#9ca3af"
                onSubmitEditing={addCustomCuisine}
              />
              <TouchableOpacity
                onPress={addCustomCuisine}
                disabled={!customCuisine.trim()}
                className={`rounded-lg px-4 py-2 ${
                  customCuisine.trim() ? 'bg-earth-600' : 'bg-gray-400'
                }`}>
                <Text
                  style={{ fontFamily: 'Nunito_600SemiBold' }}
                  className={`${customCuisine.trim() ? 'text-cream-50' : 'text-gray-200'}`}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="mb-3 text-lg text-earth-800">
              Difficulty
            </Text>
            <View className="flex-row justify-between">
              {DIFFICULTY_OPTIONS.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  onPress={() =>
                    setPreferences((prev) => ({ ...prev, preferred_difficulty: difficulty }))
                  }
                  className={`mx-1 flex-1 rounded-lg border-2 py-3 ${
                    preferences.preferred_difficulty === difficulty
                      ? 'border-earth-600 bg-earth-600'
                      : 'border-earth-300 bg-cream-50'
                  }`}>
                  <Text
                    style={{ fontFamily: 'Nunito_500Medium' }}
                    className={`text-center ${
                      preferences.preferred_difficulty === difficulty
                        ? 'text-cream-50'
                        : 'text-earth-700'
                    }`}>
                    {difficulty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="mb-3 text-lg text-earth-800">
              Cooking Time (minutes)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {TIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() =>
                    setPreferences((prev) => ({ ...prev, preferred_time_minutes: time }))
                  }
                  className={`rounded-full border-2 px-4 py-2 ${
                    preferences.preferred_time_minutes === time
                      ? 'border-earth-600 bg-earth-600'
                      : 'border-earth-300 bg-cream-50'
                  }`}>
                  <Text
                    style={{ fontFamily: 'Nunito_500Medium' }}
                    className={`${
                      preferences.preferred_time_minutes === time
                        ? 'text-cream-50'
                        : 'text-earth-700'
                    }`}>
                    {time} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-20">
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="mb-3 text-lg text-earth-800">
              Portions
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {PORTION_OPTIONS.map((portion) => (
                <TouchableOpacity
                  key={portion}
                  onPress={() =>
                    setPreferences((prev) => ({ ...prev, preferred_portions: portion }))
                  }
                  className={`rounded-full border-2 px-4 py-2 ${
                    preferences.preferred_portions === portion
                      ? 'border-earth-600 bg-earth-600'
                      : 'border-earth-300 bg-cream-50'
                  }`}>
                  <Text
                    style={{ fontFamily: 'Nunito_500Medium' }}
                    className={`${
                      preferences.preferred_portions === portion
                        ? 'text-cream-50'
                        : 'text-earth-700'
                    }`}>
                    {portion} serving{portion > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleComplete}
            disabled={!isFormValid() || loading}
            className={`rounded-lg py-4 ${isFormValid() ? 'bg-earth-600' : 'bg-gray-400'}`}>
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className={`text-center text-lg ${isFormValid() ? 'text-cream-50' : 'text-gray-200'}`}>
              {loading ? 'Saving...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}
