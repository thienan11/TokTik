import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

export default function () {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <TouchableOpacity
        className="bg-black px-8 py-4 rounded-lg"
        onPress={() => router.push("/(tabs)")}
      >
        <Text className="text-white font-bold text-xl">Login</Text>
      </TouchableOpacity>
    </View>
  );
}
