import { Text, TextInput, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { supabase } from "@/utils/supabase"

export default function () {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) return console.error(error);

    // If successful, create a user in the User table
    const { error: userError } = await supabase.from('User').insert({
      id: data.user.id, // use the user object that we get back from auth ('data' data object) as primary key in User table
      username: username,
      email: email,
    });
    if (userError) return console.error(userError);

    router.back(); // dismiss signup modal first before redirecting to tabs
    router.push('/(tabs)');
    console.log("Signup Successful!");
  };

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
            // onPress={() => router.push("/(tabs)")}
            onPress={handleSignup}
          >
            <Text className="text-white font-bold text-lg text-center">Signup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}