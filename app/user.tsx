import { Text, View, TouchableOpacity, SafeAreaView } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useLocalSearchParams } from "expo-router";
import Header from "@/components/Header";
import Profile from "@/components/Profile";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";

export default function () {
  const [user, setUser] = useState(null);
  const params = useLocalSearchParams();
  // console.log(params);

  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);

  const getUser = async () => {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("id", params.user_id)
      .single();
    if (error) return console.error(error);
    // console.log(data);
    setUser(data);
  };

  const getFollowing = async () => {
    const { data, error } = await supabase
      .from("Follower")
      .select("*")
      .eq("user_id", params.user_id);
    if (error) return console.error(error);
    setFollowing(data);
  };

  const getFollowers = async () => {
    const { data, error } = await supabase
      .from("Follower")
      .select("*")
      .eq("follower_user_id", params.user_id);
    if (error) return console.error(error);
    setFollowers(data);
  };

  useEffect(() => {
    getUser();
    getFollowing();
    getFollowers();
  }, [params.user_id]);

  return (
    <SafeAreaView className="flex-1">
      <Header title={user?.username} color="black" goBack />
      <Profile user={user} following={following} followers={followers} />
    </SafeAreaView>
  );
}
