import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

export default function () {
  const router = useRouter();
  const { friends } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .in("id", friends);
    if (error) return console.log(error);
    setUsers(data);
  };

  return (
    <SafeAreaView className="flex-1 items-center">
      <Text className="text-black font-bold text-3xl text-center">Inbox</Text>
      <TouchableOpacity
        onPress={() => router.push("/followers")}
        className="flex-row gap-2 items-center w-full m-2"
      >
        <View className="flex-row justify-between w-full items-center pr-3">
          <View className="flex-row gap-2 m-2">
            <View className="w-12 h-12 rounded-full bg-blue-400 items-center justify-center">
              <Ionicons name="people" size={30} color="white" />
            </View>
            <View>
              <Text className="font-bold text-base">New Followers</Text>
              <Text>Say hi</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/activity")}
        className="flex-row gap-2 items-center w-full m-2"
      >
        <View className="flex-row justify-between w-full items-center pr-3">
          <View className="flex-row gap-2 m-2">
            <View className="w-12 h-12 rounded-full bg-red-400 items-center justify-center">
              <Ionicons name="time" size={30} color="white" />
            </View>
            <View>
              <Text className="font-bold text-base">Activity</Text>
              <Text>See what people are doing</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </View>
      </TouchableOpacity>
      <View className="flex-1">
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          style={{ width: '100%' }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/chat?chat_user_id=${item.id}`)}
              className="flex-row gap-2 items-center w-full m-2"
            >
              <View className="flex-row justify-between w-full items-center pr-7">
                <View className="flex-row gap-2 m-2">
                  <Image
                    source={{ uri: "https://placehold.co/40x40" }}
                    className="w-12 h-12 rounded-full bg-black"
                  />
                  <View>
                    <Text className="font-bold text-base">
                      {item.username}
                    </Text>
                    <Text>Say hi</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </View>
            </TouchableOpacity>
          )}
          />
      </View>
    </SafeAreaView>
  );
}
