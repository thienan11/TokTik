import {
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/utils/supabase";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function ({
  user,
  following,
  followers,
}: {
  user: any;
  following: any;
  followers: any;
}) {
  const {
    user: authUser,
    signOut,
    following: myFollowing,
    getFollowing,
    avatarUrl,
    fetchUserAvatar,
  } = useAuth();
  const [profilePic, setProfilePic] = useState<string>("");

  const pickImage = async () => {
    if (authUser?.id !== user?.id) return; // if user is not you, they can't update your profile pic

    // No permissions request is necessary for launching the image library (limited/private access only)
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
    });

    console.log(result);
    setProfilePic(result.assets[0].uri);
    saveImage(result.assets[0].uri);
  };

  const saveImage = async (uri: string) => {
    const formData = new FormData();
    const fileName = uri?.split("/").pop();
    const extension = fileName?.split(".").pop();
    formData.append("file", {
      type: `image/${extension}`,
      name: `avatar.${extension}`,
      uri,
    });

    // push form to Supabase
    const { data, error } = await supabase.storage
      .from(`avatars/${user?.id}`)
      .upload(`avatar.${extension}`, formData, {
        cacheControl: "3600000000", // won't be changed much once uploaded; want to cache it for a long period of time (save on storage cost)
        upsert: true, // overwrite old with new
      });
    if (error) {
      console.error(error);
      return; // Exit if there's an error
    }

    // Fetch the updated avatar URL after successfully saving the image
    // await fetchUserAvatar(user?.id);
  };

  const followerUser = async () => {
    const { error } = await supabase.from("Follower").insert({
      user_id: authUser?.id, // we are taking the action so we want OUR user id
      follower_user_id: user?.id,
    });
    if (!error) getFollowing(authUser?.id);
  };

  const unFollowerUser = async () => {
    const { error } = await supabase
      .from("Follower")
      .delete()
      .eq("user_id", authUser?.id)
      .eq("follower_user_id", user?.id);
    if (!error) getFollowing(authUser?.id);
  };

  return (
    <SafeAreaView className="flex-1 items-center">
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{
            uri: profilePic || avatarUrl || "https://placeholder.com/40x40",
          }}
          className="w-20 h-20 rounded-full bg-black"
        />
      </TouchableOpacity>
      <Text className="text-2xl font-bold my-3">@{user?.username}</Text>
      <View className="flex-row w-full my-3">
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-semibold">Following</Text>
          <Text className="text-xl">{following.length}</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-semibold">Followers</Text>
          <Text className="text-xl ">{followers.length}</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-semibold">Likes</Text>
          <Text className="text-xl ">1000</Text>
        </View>
      </View>
      {authUser?.id === user?.id ? (
        <TouchableOpacity
          className="bg-black px-4 py-2 rounded-lg m-3"
          onPress={signOut}
        >
          <Text className="text-white font-bold text-lg text-center">
            Sign Out
          </Text>
        </TouchableOpacity>
      ) : (
        <View>
          {myFollowing.filter((u: any) => u.follower_user_id === user?.id)
            .length > 0 ? (
            <TouchableOpacity
              className="bg-black px-4 py-2 rounded-lg w-full m-3"
              onPress={unFollowerUser}
            >
              <Text className="text-white font-bold text-lg text-center">
                Unfollow
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-black px-4 py-2 rounded-lg w-full m-3"
              onPress={followerUser}
            >
              <Text className="text-white font-bold text-lg text-center">
                Follow
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
