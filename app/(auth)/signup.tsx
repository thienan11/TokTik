import { Text, TextInput, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function () {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { signUp } = useAuth();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 items-center justify-center bg-white">
        <View className="w-full p-4">
          <Text className="text-black font-bold text-5xl text-center mb-4">Signup</Text>
          <TextInput
            placeholder="Username"
            placeholderTextColor="gray"
            value={username}
            onChangeText={setUsername}
            className="bg-white p-4 rounded-lg border border-gray-300 w-full mb-4"
          />
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
            onPress={() => signUp(username, email, password)}
          >
            <Text className="text-white font-bold text-lg text-center">Signup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}