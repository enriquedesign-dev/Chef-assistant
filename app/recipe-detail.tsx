import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';
import { supabase } from '~/utils/supabase';
import { GeneratedRecipe } from '~/utils/ai';

export default function RecipeDetailScreen() {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipe: GeneratedRecipe = JSON.parse(params.recipe as string);

  const handleSaveRecipe = async () => {
    try {
      setSaving(true);

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
      setSaving(false);
    }
  };

  return (
    <Container>
      <View className="flex-1 flex-col bg-cream-50">
        <Stack.Screen options={{ title: recipe.title, headerShown: false }} />

        <ScrollView className="flex-grow px-6 pt-12" contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-4 text-3xl text-earth-800">
            {recipe.title}
          </Text>
          <Text style={{ fontFamily: 'Nunito_400Regular' }} className="mb-6 text-earth-600">
            {recipe.description}
          </Text>

          <View className="mb-6 flex-row flex-wrap gap-2">
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
            <View className="rounded-full bg-sage-100 px-3 py-1">
              <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-sm text-sage-700">
                {recipe.servings} servings
              </Text>
            </View>
          </View>

          <View className="mb-8">
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="mb-4 text-xl text-earth-800">
              Ingredients
            </Text>
            <View className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} className="flex-row items-center">
                  <Text className="mr-2 text-earth-600">•</Text>
                  <Text style={{ fontFamily: 'Nunito_400Regular' }} className="text-earth-700">
                    {ingredient.quantity} {ingredient.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-8">
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="mb-4 text-xl text-earth-800">
              Instructions
            </Text>
            <View className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <View key={index} className="flex-row">
                  <View className="mr-3 mt-1 h-6 w-6 rounded-full bg-earth-600">
                    <Text
                      style={{ fontFamily: 'Nunito_600SemiBold' }}
                      className="flex h-full items-center justify-center text-center text-sm text-cream-50">
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'Nunito_400Regular' }}
                    className="flex-1 text-earth-700">
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleSaveRecipe}
            disabled={saving}
            className={`mb-4 flex-1 rounded-lg py-4 ${
              saving ? 'bg-gray-400' : 'bg-earth-600'
            }`}>
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="text-center text-lg text-cream-50">
              {saving ? 'Saving...' : 'Save Recipe'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 rounded-lg bg-sage-600 py-4">
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="text-center text-lg text-cream-50">
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}
