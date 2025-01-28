import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { supabase } from "@/utils/supabase"

export default function () {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) return console.error(error);
    router.push("/(tabs)");
    console.log("Login Successful!");
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="w-full p-4">
        <Text className="text-black font-bold text-5xl text-center mb-4">Login</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="gray"
          value={email}
          onChangeText={setEmail}
          className="bg-white p-4 rounded-lg border border-gray-300 w-full mb-4"
        />
        <TextInput
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor="gray"
          value={password}
          onChangeText={setPassword}
          className="bg-white p-4 rounded-lg border border-gray-300 w-full mb-4"
        />
        <TouchableOpacity
          className="bg-black px-8 py-4 rounded-lg"
          onPress={handleLogin}
        >
          <Text className="text-white font-bold text-lg text-center">Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/signup")}
        >
          <Text className="text-black font-semibold text-lg text-center mt-3">Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
