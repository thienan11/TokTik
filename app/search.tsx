import {
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Text,
  FlatList,
} from "react-native";
import Header from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function () {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);

  const search = async () => {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("username", text);
    // console.log(data);
    setResults(data);
  };

  return (
    <SafeAreaView className="flex-1">
      <Header title="Search" color="black" goBack />
      <View className="flex-row gap-2 mt-7 mx-2">
        <TextInput
          className="flex-1 bg-white p-4 rounded-3xl border border-gray-300"
          placeholder="Search"
          placeholderTextColor="gray"
          onChangeText={(i) => setText(i)}
          value={text}
        />
        <TouchableOpacity onPress={search}>
          <Ionicons name="arrow-forward-circle" size={50} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        className="flex-1 w-full"
        data={results}
        renderItem={({ item: user }) => {
          return (
            <View className="flex-row gap-2 items-center w-full m-3">
              <Image
                source={{ uri: "https://placehold.co/40x40" }}
                className="w-10 h-10 rounded-full bg-black"
              />
              <View>
                <Text className="font-bold text-base">{user.username}</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
