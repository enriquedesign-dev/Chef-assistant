import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
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

interface RecipeCardProps {
  recipe: Recipe;
  onView: () => void;
  onDelete: () => void;
  loading: boolean;
}

function RecipeCard({ recipe, onView, onDelete, loading }: RecipeCardProps) {
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;

  return (
    <View className="mb-4 rounded-xl bg-white p-6 shadow-sm">
      <View className="mb-2 flex-row items-start justify-between">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="flex-1 text-xl text-earth-800">
          {recipe.title}
        </Text>
        {recipe.is_used && (
          <View className="rounded-full bg-sage-100 px-2 py-1">
            <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-xs text-sage-700">
              Used
            </Text>
          </View>
        )}
      </View>

      <Text style={{ fontFamily: 'Nunito_400Regular' }} className="mb-4 text-earth-600">
        {recipe.description}
      </Text>

      <View className="mb-4 flex-row flex-wrap gap-2">
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
          className="rounded-lg bg-red-600 px-6 py-3"
          onPress={onDelete}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="text-center text-cream-50">
              Delete
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      Alert.alert('Error', 'Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    router.push({
      pathname: '/saved-recipe-detail',
      params: { recipe: JSON.stringify(recipe) },
    });
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    Alert.alert('Delete Recipe', 'Are you sure you want to delete this recipe?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(recipeId);

            const { error } = await supabase.from('recipes').delete().eq('id', recipeId);

            if (error) throw error;

            setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
            Alert.alert('Success', 'Recipe deleted successfully.');
          } catch (error) {
            console.error('Error deleting recipe:', error);
            Alert.alert('Error', 'Failed to delete recipe. Please try again.');
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  const handleCreateNewRecipe = () => {
    // This will open the bottom sheet for creating new recipes
    router.push('/create-recipe');
  };

  if (loading) {
    return (
      <Container>
        <View className="flex-1 bg-cream-50">
          <Stack.Screen options={{ title: 'My Recipes', headerShown: false }} />

          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mt-4 text-earth-600">
              Loading your recipes...
            </Text>
          </View>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View className="flex-1 bg-cream-50">
        <Stack.Screen options={{ title: 'My Recipes', headerShown: false }} />

        <ScrollView className="flex-1 px-6 pt-12">
          <Text
            style={{ fontFamily: 'Nunito_700Bold' }}
            className="mb-4 text-center text-4xl text-earth-800">
            My Recipes
          </Text>
          <Text
            style={{ fontFamily: 'Nunito_500Medium' }}
            className="mb-8 text-center text-lg text-earth-600">
            Your saved recipe collection
          </Text>

          {recipes.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text
                style={{ fontFamily: 'Nunito_500Medium' }}
                className="mb-4 text-center text-earth-600">
                No recipes yet
              </Text>
              <Text
                style={{ fontFamily: 'Nunito_400Regular' }}
                className="mb-8 text-center text-earth-500">
                Create your first recipe to get started
              </Text>
            </View>
          ) : (
            recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={() => handleViewRecipe(recipe)}
                onDelete={() => handleDeleteRecipe(recipe.id)}
                loading={deleting === recipe.id}
              />
            ))
          )}
        </ScrollView>

        <View className="px-6 pb-8">
          <Button onPress={handleCreateNewRecipe} className="mb-4">
            Create New Recipe
          </Button>
        </View>
      </View>
    </Container>
  );
}
