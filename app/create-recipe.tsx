import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';
import { supabase } from '~/utils/supabase';
import { aiService, GeneratedRecipe } from '~/utils/ai';

interface Preferences {
  diet?: string;
  tastes?: string[];
  preferred_difficulty?: 'Easy' | 'Medium' | 'Hard';
  preferred_time_minutes?: number;
  preferred_portions?: number;
}

interface RecipeCardProps {
  recipe: GeneratedRecipe;
  onView: () => void;
  onSave: () => void;
  loading: boolean;
}

function RecipeCard({ recipe, onView, onSave, loading }: RecipeCardProps) {
  return (
    <View className="mb-4 rounded-xl bg-white p-6 shadow-sm">
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-2 text-2xl text-earth-800">
        {recipe.title}
      </Text>
      <Text style={{ fontFamily: 'Nunito_400Regular' }} className="mb-4 text-earth-600">
        {recipe.description}
      </Text>

      <View className="mb-4 flex-row flex-wrap gap-2">
        <View className="rounded-full bg-sage-100 px-3 py-1">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-sm text-sage-700">
            {recipe.difficulty}
          </Text>
        </View>
        <View className="rounded-full bg-earth-100 px-3 py-1">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-sm text-earth-700">
            {recipe.type}
          </Text>
        </View>
        <View className="rounded-full bg-cream-100 px-3 py-1">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-sm text-earth-700">
            {recipe.time}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 rounded-lg border-2 border-earth-600 py-3"
          onPress={onView}>
          <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-center text-earth-600">
            View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-lg bg-earth-600 py-3"
          onPress={onSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="text-center text-cream-50">
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CreateRecipeScreen() {
  const [preferences, setPreferences] = useState<Preferences>({
    diet: '',
    tastes: [],
    preferred_difficulty: undefined,
    preferred_time_minutes: undefined,
    preferred_portions: undefined,
  });
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      console.log('📥 Fetching user preferences...');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No user found when fetching preferences');
        throw new Error('No user found');
      }
      console.log('✅ User found:', user.id);

      const { data: prefs, error } = await supabase.from('user_preferences').select('*').single();

      if (error) {
        console.log('⚠️ No preferences found for user (this is normal for first-time users):', error.message);
        // Don't throw here - it's normal for users to not have preferences yet
        return;
      }

      if (prefs) {
        console.log('✅ Preferences loaded:', prefs);
        setPreferences({
          diet: prefs.diet || '',
          tastes: prefs.tastes || [],
          preferred_difficulty: prefs.preferred_difficulty || undefined,
          preferred_time_minutes: prefs.preferred_time_minutes || undefined,
          preferred_portions: prefs.preferred_portions || undefined,
        });
        console.log('✅ Preferences state updated');
      }
    } catch (error) {
      console.error('❌ Error fetching preferences:', error);
      Alert.alert('Error', 'Failed to load preferences. Using default values.');
    }
  };

  const generateRecipes = async () => {
    try {
      console.log('🚀 Starting recipe generation...');
      setGenerating(true);

      // Get user data
      console.log('👤 Getting user data...');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No user found when generating recipes');
        throw new Error('No user found');
      }
      console.log('✅ User found:', user.id);

      // Get user's ingredients
      console.log('🥕 Getting user ingredients...');
      const { data: ingredients, error: ingredientsError } = await supabase.from('ingredients').select('name');
      
      if (ingredientsError) {
        console.error('❌ Error fetching ingredients:', ingredientsError);
        throw new Error('Failed to fetch ingredients');
      }
      console.log('✅ Ingredients found:', ingredients?.length || 0, 'items');

      // Get user's utensils
      console.log('🔧 Getting user utensils...');
      const { data: utensils, error: utensilsError } = await supabase.from('utensils').select('name');
      
      if (utensilsError) {
        console.error('❌ Error fetching utensils:', utensilsError);
        throw new Error('Failed to fetch utensils');
      }
      console.log('✅ Utensils found:', utensils?.length || 0, 'items');

      if (!ingredients || !utensils) {
        console.error('❌ Missing user data - ingredients or utensils not found');
        throw new Error('Missing user data');
      }

      const ingredientNames = ingredients.map((i) => i.name);
      const utensilNames = utensils.map((u) => u.name);
      
      console.log('📤 Sending to AI service:');
      console.log('   - Ingredients:', ingredientNames);
      console.log('   - Utensils:', utensilNames);
      console.log('   - Preferences:', preferences);

      const generatedRecipes = await aiService.generateRecipes(
        ingredientNames,
        utensilNames,
        {
          diet: preferences.diet || undefined,
          tastes: preferences.tastes || undefined,
          preferred_difficulty: preferences.preferred_difficulty || undefined,
          preferred_time_minutes: preferences.preferred_time_minutes || undefined,
          preferred_portions: preferences.preferred_portions || undefined,
        }
      );

      console.log('✅ Generated recipes received:', generatedRecipes.length, 'recipes');
      setRecipes(generatedRecipes);
    } catch (error) {
      console.error('❌ Error generating recipes:', error);
      Alert.alert('Error', 'Failed to generate recipes. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewRecipe = (recipe: GeneratedRecipe) => {
    router.push({
      pathname: '/recipe-detail',
      params: { recipe: JSON.stringify(recipe) },
    });
  };

  const handleSaveRecipe = async (recipe: GeneratedRecipe) => {
    try {
      setSaving(recipe.title);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Parse time to get prep and cook times (simplified)
      const timeInMinutes = parseInt(recipe.time) || 30;
      const prepTime = Math.floor(timeInMinutes * 0.3);
      const cookTime = Math.floor(timeInMinutes * 0.7);

      const { error } = await supabase.from('recipes').insert({
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time_minutes: prepTime,
        cook_time_minutes: cookTime,
        servings: recipe.servings,
        is_used: false,
      });

      if (error) throw error;

      Alert.alert('Success', 'Recipe saved successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/dashboard'),
        },
      ]);
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleSavePreferences = async () => {
    try {
      console.log('💾 Saving user preferences...');
      console.log('📊 Current preferences to save:', preferences);
      
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No user found when saving preferences');
        throw new Error('No user found');
      }
      console.log('✅ User found for saving preferences:', user.id);

      const preferencesToSave = {
        id: user.id,
        diet: preferences.diet || null,
        tastes: preferences.tastes || [],
        preferred_difficulty: preferences.preferred_difficulty || null,
        preferred_time_minutes: preferences.preferred_time_minutes || null,
        preferred_portions: preferences.preferred_portions || null,
      };

      console.log('📤 Preferences to save to database:', preferencesToSave);

      const { data, error } = await supabase.from('user_preferences').upsert(preferencesToSave);

      if (error) {
        console.error('❌ Database error saving preferences:', error);
        throw error;
      }

      console.log('✅ Preferences saved successfully:', data);
      Alert.alert('Success', 'Preferences saved successfully!');
    } catch (error) {
      console.error('❌ Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <View className="flex-1 bg-cream-50">
        <Stack.Screen options={{ title: 'Create New Recipe', headerShown: false }} />

        <ScrollView className="flex-1 px-6 pt-12">
          <Text
            style={{ fontFamily: 'Nunito_700Bold' }}
            className="mb-4 text-center text-4xl text-earth-800">
            Create New Recipe
          </Text>
          <Text
            style={{ fontFamily: 'Nunito_500Medium' }}
            className="mb-8 text-center text-lg text-earth-600">
            Customize your preferences and generate recipes
          </Text>

          <View className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="mb-4 text-xl text-earth-800">
              Preferences
            </Text>

            <View className="space-y-4">
              <View>
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
                  Dietary Preference
                </Text>
                <TouchableOpacity
                  className="rounded-lg border-2 border-earth-200 px-4 py-3"
                  onPress={() => {
                    const options = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto'];
                    Alert.alert(
                      'Dietary Preference',
                      'Select your dietary preference',
                      options.map((option) => ({
                        text: option,
                        onPress: () => {
                          console.log('🎯 Setting diet preference to:', option === 'None' ? '' : option);
                          setPreferences((prev) => ({
                            ...prev,
                            diet: option === 'None' ? '' : option,
                          }));
                        }
                      }))
                    );
                  }}>
                  <Text style={{ fontFamily: 'Nunito_400Regular' }} className="text-earth-700">
                    {preferences.diet || 'Select dietary preference'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
                  Preferred Difficulty
                </Text>
                <TouchableOpacity
                  className="rounded-lg border-2 border-earth-200 px-4 py-3"
                  onPress={() => {
                    const options = ['Any', 'Easy', 'Medium', 'Hard'];
                    Alert.alert(
                      'Difficulty',
                      'Select preferred difficulty',
                      options.map((option) => ({
                        text: option,
                        onPress: () => {
                          console.log('🎯 Setting difficulty preference to:', option === 'Any' ? undefined : option);
                          setPreferences((prev) => ({
                            ...prev,
                            preferred_difficulty: option === 'Any' ? undefined : (option as any),
                          }));
                        },
                      }))
                    );
                  }}>
                  <Text style={{ fontFamily: 'Nunito_400Regular' }} className="text-earth-700">
                    {preferences.preferred_difficulty || 'Any difficulty'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
                  Preferred Cooking Time (minutes)
                </Text>
                <TouchableOpacity
                  className="rounded-lg border-2 border-earth-200 px-4 py-3"
                  onPress={() => {
                    const options = ['Any', '15', '30', '45', '60', '90+'];
                    Alert.alert(
                      'Cooking Time',
                      'Select preferred cooking time',
                      options.map((option) => ({
                        text: option,
                        onPress: () => {
                          console.log('🎯 Setting time preference to:', option === 'Any' ? undefined : parseInt(option));
                          setPreferences((prev) => ({
                            ...prev,
                            preferred_time_minutes: option === 'Any' ? undefined : parseInt(option),
                          }));
                        },
                      }))
                    );
                  }}>
                  <Text style={{ fontFamily: 'Nunito_400Regular' }} className="text-earth-700">
                    {preferences.preferred_time_minutes
                      ? `${preferences.preferred_time_minutes} minutes`
                      : 'Any time'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
                  Preferred Portions
                </Text>
                <TouchableOpacity
                  className="rounded-lg border-2 border-earth-200 px-4 py-3"
                  onPress={() => {
                    const options = ['Any', '1', '2', '4', '6', '8'];
                    Alert.alert(
                      'Portions',
                      'Select preferred portions',
                      options.map((option) => ({
                        text: option,
                        onPress: () => {
                          console.log('🎯 Setting portions preference to:', option === 'Any' ? undefined : parseInt(option));
                          setPreferences((prev) => ({
                            ...prev,
                            preferred_portions: option === 'Any' ? undefined : parseInt(option),
                          }));
                        },
                      }))
                    );
                  }}>
                  <Text style={{ fontFamily: 'Nunito_400Regular' }} className="text-earth-700">
                    {preferences.preferred_portions
                      ? `${preferences.preferred_portions} portions`
                      : 'Any portions'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button onPress={handleSavePreferences} loading={loading} className="mt-6">
              Save Preferences
            </Button>
          </View>

          <Button onPress={generateRecipes} loading={generating} className="mb-8">
            Generate Recipes
          </Button>

          {recipes.map((recipe, index) => (
            <RecipeCard
              key={index}
              recipe={recipe}
              onView={() => handleViewRecipe(recipe)}
              onSave={() => handleSaveRecipe(recipe)}
              loading={saving === recipe.title}
            />
          ))}
        </ScrollView>
      </View>
    </Container>
  );
}
