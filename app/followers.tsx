import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "@/components/Header";

export default function () {
  const { followers } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <Header title="Followers" goBack color="black" />
      <FlatList
        data={followers}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/user?user_id=${item.user_id}`)}
            className="flex-row gap-2 items-center w-full m-2"
          >
            <View className="flex-row justify-between w-full items-center pr-5">
              <View className="flex-row gap-2 m-2">
                <Image
                  source={{ uri: "https://placehold.co/40x40" }}
                  className="w-12 h-12 rounded-full bg-black"
                />
                <View>
                  <Text className="font-bold text-base">
                    {item.User.username}
                  </Text>
                  <Text>Say hi</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="black" />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
