import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { supabase } from '~/utils/supabase';
import { Container } from '~/components/Container';

export default function Register() {
  const router = useRouter();
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            display_name: name,
          },
        },
      });

      if (error) {
        Alert.alert('Registration Failed', error.message);
      } else {
        Alert.alert(
          'Registration Successful',
          'Your account has been created! Please check your email to confirm your account, then login to get started.',
          [
            {
              text: 'Go to Login',
              onPress: () => {
                // Clear any existing session to prevent seeing previous user's data
                supabase.auth.signOut();
                router.push('/login');
              },
            },
          ]
        );
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Register', headerShown: false }} />
      <View className="flex-1 bg-cream-50">
        <View className="mb-8 flex-row items-center px-6 pb-4 pt-12">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-2xl text-earth-600">
              ←
            </Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-2xl text-earth-800">
            Register
          </Text>
        </View>

        <View className="mb-6 px-6">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
            Name
          </Text>
          <TextInput
            ref={nameInputRef}
            blurOnSubmit={false}
            className="rounded-lg border border-sage-300 bg-white px-4 py-3 font-sans"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => {
              setTimeout(() => {
                emailInputRef.current?.focus();
              }, 50);
            }}
          />
        </View>

        <View className="mb-6 px-6">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
            Email
          </Text>
          <TextInput
            ref={emailInputRef}
            blurOnSubmit={false}
            className="rounded-lg border border-sage-300 bg-white px-4 py-3 font-sans"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
        </View>

        <View className="mb-6 px-6">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
            Password
          </Text>
          <TextInput
            ref={passwordInputRef}
            blurOnSubmit={false}
            className="rounded-lg border border-sage-300 bg-white px-4 py-3 font-sans"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          />
        </View>

        <View className="mb-8 px-6">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
            Confirm Password
          </Text>
          <TextInput
            ref={confirmPasswordInputRef}
            blurOnSubmit={false}
            className="rounded-lg border border-sage-300 bg-white px-4 py-3 font-sans"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
        </View>

        <TouchableOpacity
          className="mx-6 mb-4 rounded-lg bg-earth-600 py-4"
          onPress={handleRegister}
          disabled={loading}>
          <Text
            style={{ fontFamily: 'Nunito_600SemiBold' }}
            className="text-center text-lg text-cream-50">
            {loading ? 'Creating Account...' : 'Register'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} className="px-6">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-center text-earth-600">
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}
