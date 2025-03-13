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
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function ({
  messages,
  addMessage,
}: {
  messages: any[];
  addMessage: (message: any) => void;
}) {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [text, setText] = useState<string>("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 items-center justify-center bg-white">
          <FlatList
            className="flex-1 w-full"
            data={messages}
            renderItem={({ item }) => {
              return (
                <View className="flex-row gap-2 items-center w-full m-2">
                  <Image
                    source={{
                      uri:
                        `${process.env.EXPO_PUBLIC_BUCKET}/avatars/${item.User?.id}/avatar` ||
                        "https://placehold.co/40x40",
                    }}
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
            <TouchableOpacity
              onPress={() => {
                setText(""); // clear prev text after successful insert
                Keyboard.dismiss(); // dismiss after successful insert
                addMessage(text);
              }}
            >
              <Ionicons name="arrow-forward-circle" size={50} color="black" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
