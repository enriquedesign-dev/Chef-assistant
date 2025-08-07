import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container } from '~/components/Container';

import { supabase } from '~/utils/supabase';
import { aiService, GeneratedRecipe } from '~/utils/ai';

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

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const router = useRouter();
  const hasGeneratedRef = useRef(false);

  const generateRecipes = useCallback(async () => {
    try {
      console.log('🚀 Starting onboarding recipe generation...');
      setLoading(true);

      // Get user data
      console.log('👤 Getting user data...');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No user found when generating onboarding recipes');
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

      // Get user preferences
      console.log('⚙️ Getting user preferences...');
      const { data: preferences, error: preferencesError } = await supabase.from('user_preferences').select('*').single();
      
      if (preferencesError) {
        console.error('❌ Error fetching preferences:', preferencesError);
        throw new Error('Failed to fetch preferences');
      }
      console.log('✅ Preferences found:', preferences);

      if (!ingredients || !utensils || !preferences) {
        console.error('❌ Missing user data - ingredients, utensils, or preferences not found');
        throw new Error('Missing user data');
      }

      const ingredientNames = ingredients.map((i) => i.name);
      const utensilNames = utensils.map((u) => u.name);
      
      console.log('📤 Sending to AI service (onboarding):');
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

      console.log('✅ Generated onboarding recipes received:', generatedRecipes.length, 'recipes');
      setRecipes(generatedRecipes);
    } catch (error) {
      console.error('❌ Error generating onboarding recipes:', error);
      Alert.alert('Error', 'Failed to generate recipes. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!hasGeneratedRef.current) {
      generateRecipes();
      hasGeneratedRef.current = true;
    }
  }, [generateRecipes]);

  const handleViewRecipe = (recipe: GeneratedRecipe) => {
    // Navigate to recipe detail view
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

      // Mark onboarding as complete
      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id);

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

  if (loading) {
    return (
      <Container>
        <View className="flex-1 bg-cream-50">
          <Stack.Screen options={{ title: 'Your First Recipes', headerShown: false }} />

          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mt-4 text-earth-600">
              Generating your personalized recipes...
            </Text>
          </View>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View className="flex-1 bg-cream-50">
        <Stack.Screen options={{ title: 'Your First Recipes', headerShown: false }} />

        <ScrollView className="flex-1 px-6 pt-12">
          <Text
            style={{ fontFamily: 'Nunito_700Bold' }}
            className="mb-4 text-center text-4xl text-earth-800">
            Your First Recipes
          </Text>
          <Text
            style={{ fontFamily: 'Nunito_500Medium' }}
            className="mb-8 text-center text-lg text-earth-600">
            Based on your ingredients and preferences
          </Text>

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
