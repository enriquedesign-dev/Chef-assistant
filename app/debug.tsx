import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { Container } from '~/components/Container';
import { useState, useEffect } from 'react';

interface Profile {
  full_name: string;
  onboarding_complete: boolean;
}

interface UserPreferences {
  diet: string;
  tastes: string[];
  preferred_difficulty: string;
  preferred_time_minutes: number;
  preferred_portions: number;
}

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

interface Utensil {
  id: number;
  name: string;
}

export default function Debug() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [utensils, setUtensils] = useState<Utensil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, onboarding_complete')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Load preferences
      const { data: prefData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('id', user.id)
        .single();

      setPreferences(prefData);

      // Load ingredients
      const { data: ingData } = await supabase
        .from('ingredients')
        .select('*')
        .order('created_at', { ascending: false });

      setIngredients(ingData || []);

      // Load utensils
      const { data: utData } = await supabase
        .from('utensils')
        .select('*')
        .order('created_at', { ascending: false });

      setUtensils(utData || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.push('/');
    }
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Debug', headerShown: false }} />

      <ScrollView className="flex-1 bg-cream-50">
        <View className="px-6 pt-6">
          <View className="mb-8 flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-3xl text-earth-800">
              Debug Screen
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-terracotta-500 rounded-lg px-4 py-2">
              <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-cream-50">
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-center text-earth-600">
              Loading...
            </Text>
          ) : (
            <>
              {profile && (
                <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                  <Text
                    style={{ fontFamily: 'Nunito_600SemiBold' }}
                    className="mb-4 text-xl text-earth-800">
                    Profile
                  </Text>
                  <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-600">
                    Name: {profile.full_name || 'Not set'}
                  </Text>
                  <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-earth-600">
                    Onboarding Complete: {profile.onboarding_complete ? 'Yes' : 'No'}
                  </Text>
                </View>
              )}

              {preferences && (
                <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                  <Text
                    style={{ fontFamily: 'Nunito_600SemiBold' }}
                    className="mb-4 text-xl text-earth-800">
                    Preferences
                  </Text>
                  <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-600">
                    Diet: {preferences.diet}
                  </Text>
                  <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-600">
                    Tastes: {preferences.tastes.join(', ')}
                  </Text>
                  <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-600">
                    Difficulty: {preferences.preferred_difficulty}
                  </Text>
                  <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-600">
                    Time: {preferences.preferred_time_minutes} minutes
                  </Text>
                  <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-earth-600">
                    Portions: {preferences.preferred_portions}
                  </Text>
                </View>
              )}

              <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                <Text
                  style={{ fontFamily: 'Nunito_600SemiBold' }}
                  className="mb-4 text-xl text-earth-800">
                  Ingredients ({ingredients.length})
                </Text>
                {ingredients.map((ingredient) => (
                  <Text
                    key={ingredient.id}
                    style={{ fontFamily: 'Nunito_500Medium' }}
                    className="mb-1 text-earth-600">
                    • {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                  </Text>
                ))}
                {ingredients.length === 0 && (
                  <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-earth-600">
                    No ingredients found
                  </Text>
                )}
              </View>

              <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                <Text
                  style={{ fontFamily: 'Nunito_600SemiBold' }}
                  className="mb-4 text-xl text-earth-800">
                  Utensils ({utensils.length})
                </Text>
                {utensils.map((utensil) => (
                  <Text
                    key={utensil.id}
                    style={{ fontFamily: 'Nunito_500Medium' }}
                    className="mb-1 text-earth-600">
                    • {utensil.name}
                  </Text>
                ))}
                {utensils.length === 0 && (
                  <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-earth-600">
                    No utensils found
                  </Text>
                )}
              </View>

              <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                <Text
                  style={{ fontFamily: 'Nunito_600SemiBold' }}
                  className="mb-4 text-xl text-earth-800">
                  Auth Status
                </Text>
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-600">
                  You are successfully logged in!
                </Text>
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-forest-600">
                  Connected to Supabase
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            className="rounded-lg bg-earth-600 py-4"
            onPress={() => router.push('/')}>
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="text-center text-lg text-cream-50">
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}
