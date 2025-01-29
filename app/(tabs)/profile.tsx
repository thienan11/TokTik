import { Text, View, TouchableOpacity } from 'react-native';
import { useAuth } from "@/providers/AuthProvider";

export default function () {
  const { user, signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className='text-black font-bold text-3xl'>{user?.username}</Text>
      <TouchableOpacity className="bg-black px-4 py-2 rounded-lg" onPress={signOut}>
        <Text className="text-white font-bold text-lg">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}