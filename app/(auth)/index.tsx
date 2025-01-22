import { Text, TouchableOpacity, View } from "react-native";
import { Link, useRouter } from "expo-router";

export default function () {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-black font-bold text-3xl">Login</Text>
      {/* <Link href="/(tabs)">Home</Link> */}
      <TouchableOpacity
        className="bg-black p-4 rounded-lg"
        onPress={() => router.push("/(tabs)")}
      >
        <Text className="text-white font-bold text-lg">This is a button!</Text>
      </TouchableOpacity>
    </View>
  );
}
