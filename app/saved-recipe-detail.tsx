import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';
import { supabase } from '~/utils/supabase';

interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: {
    name: string;
    quantity: string;
  }[];
  instructions: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  is_used: boolean;
  created_at: string;
}

export default function SavedRecipeDetailScreen() {
  const [cooking, setCooking] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipe: Recipe = JSON.parse(params.recipe as string);

  const handleCookRecipe = async () => {
    Alert.alert(
      'Cook Recipe',
      'This will subtract the ingredients from your inventory. Are you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Cook',
          style: 'default',
          onPress: async () => {
            try {
              setCooking(true);

              const { data, error } = await supabase.rpc('select_recipe_and_subtract_ingredients', {
                recipe_id_to_use: recipe.id,
              });

              if (error) throw error;

              if (data && data.startsWith('Success')) {
                Alert.alert(
                  'Success',
                  'Ingredients have been subtracted from your inventory. Enjoy your meal!'
                );
                // Refresh the recipe data
                router.replace('/dashboard');
              } else {
                Alert.alert(
                  'Error',
                  data || 'Failed to cook recipe. Please check your ingredients.'
                );
              }
            } catch (error) {
              console.error('Error cooking recipe:', error);
              Alert.alert('Error', 'Failed to cook recipe. Please try again.');
            } finally {
              setCooking(false);
            }
          },
        },
      ]
    );
  };

  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;

  return (
    <Container>
      <View className="flex-1 bg-cream-50">
        <Stack.Screen options={{ title: recipe.title, headerShown: false }} />

        <ScrollView className="flex-1 px-6 pt-12">
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-4 text-3xl text-earth-800">
            {recipe.title}
          </Text>
          <Text style={{ fontFamily: 'Nunito_400Regular' }} className="mb-6 text-earth-600">
            {recipe.description}
          </Text>

          <View className="mb-6 flex-row flex-wrap gap-2">
            <View className="rounded-full bg-cream-100 px-3 py-1">
              <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-sm text-earth-700">
                {totalTime} min
              </Text>
            </View>
            <View className="rounded-full bg-sage-100 px-3 py-1">
              <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-sm text-sage-700">
                {recipe.servings} servings
              </Text>
            </View>
            {recipe.is_used && (
              <View className="rounded-full bg-sage-100 px-3 py-1">
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-sm text-sage-700">
                  Used
                </Text>
              </View>
            )}
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
          {!recipe.is_used && (
            <Button onPress={handleCookRecipe} loading={cooking} className="mb-4">
              Cook This Recipe
            </Button>
          )}

          <TouchableOpacity
            className="rounded-lg border-2 border-earth-600 py-4"
            onPress={() => router.back()}>
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="text-center text-lg text-earth-600">
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}
