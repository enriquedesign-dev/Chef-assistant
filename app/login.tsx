import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { supabase } from '~/utils/supabase';
import { Container } from '~/components/Container';

export default function Login() {
  const router = useRouter();
  const passwordInputRef = useRef<TextInput>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        // Check onboarding status after successful login
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', user.id)
            .single();

          if (profile?.onboarding_complete) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding/ingredients');
          }
        }
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Login', headerShown: false }} />
      <View className="flex-1 bg-cream-50">
        <View className="mb-8 flex-row items-center px-6 pb-4 pt-12">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-2xl text-earth-600">
              ←
            </Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-2xl text-earth-800">
            Login
          </Text>
        </View>

        <View className="mb-6 px-6">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
            Email
          </Text>
          <TextInput
            blurOnSubmit={false}
            className="rounded-lg border border-sage-300 bg-white px-4 py-3 font-sans"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your email"
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
        </View>

        <View className="mb-8 px-6">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
            Password
          </Text>
          <TextInput
            ref={passwordInputRef}
            className="rounded-lg border border-sage-300 bg-white px-4 py-3 font-sans"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={handleLogin}
          />
        </View>

        <TouchableOpacity
          className="mx-6 mb-4 rounded-lg bg-earth-600 py-4"
          onPress={handleLogin}
          disabled={loading}>
          <Text
            style={{ fontFamily: 'Nunito_600SemiBold' }}
            className="text-center text-lg text-cream-50">
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')} className="px-6">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-center text-earth-600">
            Don&apos;t have an account? Register
          </Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}
