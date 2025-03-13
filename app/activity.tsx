import { SafeAreaView, Text, View, FlatList, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import { supabase } from "@/utils/supabase";

export default function () {
  const { user } = useAuth();
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    getComments();
  }, []);

  const getComments = async () => {
    const { data, error } = await supabase
      .from("Comment")
      .select("*, User(*)")
      .eq("video_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) return console.log(error);
    getLikes(data);
  };

  const getLikes = async (comments: any) => {
    const { data, error } = await supabase
      .from("Like")
      .select("*, User(*)")
      .eq("video_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) return console.log(error);
    setActivity(comments.concat(data));
  };

  return (
    <SafeAreaView className="flex-1">
      <Header title="Activity" goBack color="black" />
      <FlatList
        data={activity}
        renderItem={({ item }) => (
          <View className="flex-row gap-2 m-4">
            <Image
              source={{ uri: `${process.env.EXPO_PUBLIC_BUCKET}/avatars/${item.User?.id}/avatar` || "https://placehold.co/40x40" }}
              className="w-12 h-12 rounded-full bg-black"
            />
            <View>
              <Text className="font-bold text-base">{item.User.username}</Text>
              <Text>{item.text || "Liked your video"}</Text>
              <Text className="text-gray-500 text-xs">
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
