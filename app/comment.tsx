import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function () {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    getComments();
  }, []);

  const getComments = async () => {
    const { data, error } = await supabase
      .from("Comment")
      .select("*, User(username, id)")
      .eq("video_id", params.video_id);
    if (error) return console.log(error);
    setComments(data);
  };

  const addComment = async () => {
    const { error } = await supabase.from("Comment").insert({
      user_id: user.id,
      video_id: params.video_id,
      text,
      // video_user_id: "test"
    });
    if (error) return console.log(error);
    setText(""); // clear prev comment after successful insert
    Keyboard.dismiss(); // dismiss after successful insert
    getComments(); // if successful, re-fetch comments
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 items-center justify-center bg-white">
          <Text className="text-black font-bold text-xl text-center mt-5">
            Comments
          </Text>
          <FlatList
            className="flex-1 w-full"
            data={comments}
            renderItem={({ item }) => {
              return (
                <View className="flex-row gap-2 items-center w-full m-2">
                  <Image
                    source={{ uri: "https://placehold.co/40x40" }}
                    className="w-10 h-10 rounded-full bg-black"
                  />
                  <View>
                    <Text className="font-bold text-base">
                      {item.User.username}
                    </Text>
                    <Text>{item.text}</Text>
                  </View>
                </View>
              );
            }}
          />
          <View className="flex-row gap-2 mx-3 mb-5">
            <TextInput
              className="flex-1 bg-white p-4 rounded-3xl border border-gray-300"
              placeholder="Add a comment"
              placeholderTextColor="gray"
              onChangeText={(i) => setText(i)}
              value={text}
            />
            <TouchableOpacity onPress={addComment}>
              <Ionicons name="arrow-forward-circle" size={50} color="black" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
