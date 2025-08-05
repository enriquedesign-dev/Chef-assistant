import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container } from '~/components/Container';

export default function Home() {
  const router = useRouter();

  return (
    <Container>
      <View className="flex-1 bg-cream-50">
        <Stack.Screen options={{ title: 'Home', headerShown: false }} />

        <ScrollView className="flex-1 px-6 pt-12">
          <Text
            style={{ fontFamily: 'Nunito_700Bold' }}
            className="mb-4 text-center text-4xl text-earth-800">
            Chef App
          </Text>
          <Text
            style={{ fontFamily: 'Nunito_500Medium' }}
            className="mb-8 text-center text-lg text-earth-600">
            Your personal cooking companion
          </Text>

          <View className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="mb-4 text-xl text-earth-800">
              Features
            </Text>
            <Text style={{ fontFamily: 'Nunito_400Regular' }} className="mb-2 text-earth-700">
              • Manage your ingredients inventory
            </Text>
            <Text style={{ fontFamily: 'Nunito_400Regular' }} className="mb-2 text-earth-700">
              • Discover and save recipes
            </Text>
            <Text style={{ fontFamily: 'Nunito_400Regular' }} className="mb-2 text-earth-700">
              • Smart cooking suggestions
            </Text>
            <Text style={{ fontFamily: 'Nunito_400Regular' }} className="text-earth-700">
              • Track your utensils and tools
            </Text>
          </View>
        </ScrollView>

        <View className="px-6 pb-8">
          <TouchableOpacity
            className="mb-4 rounded-lg bg-earth-600 py-4"
            onPress={() => router.push('/login')}>
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="text-center text-lg text-cream-50">
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg bg-sage-600 py-4"
            onPress={() => router.push('/register')}>
            <Text
              style={{ fontFamily: 'Nunito_600SemiBold' }}
              className="text-center text-lg text-cream-50">
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}
