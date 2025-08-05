import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Text className="mb-4 text-xl font-bold">This screen doesn&apos;t exist.</Text>
      <Link href="/" className="text-base text-blue-500">
        <Text>Go to home screen!</Text>
      </Link>
    </View>
  );
}
