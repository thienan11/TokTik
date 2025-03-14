import {
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  Dimensions,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";

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
  } = useAuth();
  const [profilePic, setProfilePic] = useState<string>("");
  const [videos, setVideos] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);

  // useEffect(() => {
  //   const loadAvatar = async () => {
  //     if (user?.id) {
  //       const fetchedAvatarUrl = await getUserAvatar(user?.id);
  //       setProfilePic(fetchedAvatarUrl);
  //     } else if (user?.id) {
  //       // If no userId is provided, use the current user's avatarUrl
  //       setProfilePic(avatarUrl);
  //     }
  //   };

  //   loadAvatar();
  // }, [user?.id, avatarUrl, getUserAvatar]);

  useEffect(() => {
    getVideos();
    getLikes();
  }, [user]);

  const getVideos = async () => {
    const { data, error } = await supabase
      .from("Video")
      .select("*, User(username, id)")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(3);
    getSignedUrls(data);
  };

  const getSignedUrls = async (videos: any[]) => {
    const { data, error } = await supabase.storage
      .from("videos")
      .createSignedUrls(
        videos.map((video) => video.uri),
        60 * 60 * 24 * 7
      );

    let videosUrls = videos?.map((item) => {
      item.signedUrl = data?.find(
        (signedUrl) => signedUrl.path === item.uri
      )?.signedUrl;
      return item;
    });

    console.log(videosUrls);
    setVideos(videosUrls);
  };

  const getLikes = async () => {
    const { data, error } = await supabase
      .from("Like")
      .select("*")
      .eq("video_user_id", user?.id);
    setLikes(data);
  };

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
      name: "avatar",
      uri,
    });

    // push form to Supabase
    const { data, error } = await supabase.storage
      .from(`avatars/${user?.id}`)
      .upload("avatar", formData, {
        cacheControl: "3600", // Cache for 1 hour
        upsert: true, // overwrite old with new
      });
    if (error) {
      console.error(error);
      return; // Exit if there's an error
    }
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

  const getProfilePic = () => {
    if (profilePic) return profilePic;
    if (user?.id)
      return `${process.env.EXPO_PUBLIC_BUCKET}/avatars/${user.id}/avatar`;
    return "https://placehold.co/40x40"; // Default placeholder
  };

  const VideoItem = ({ url }: { url: string }) => {
    const player = useVideoPlayer(url, (player) => {
      player.loop = true;
    });

    return (
      <VideoView
        style={{
          width: Dimensions.get("window").width / 3 - 4, // Adjusted width with spacing
          height: 200,
          margin: 2, // Small margin for spacing between videos
          borderRadius: 10,
          overflow: "hidden",
        }}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 items-center">
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: getProfilePic() }}
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
          <Text className="text-xl ">{likes.length}</Text>
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
      {videos.length > 0 ? (
        <FlatList
          numColumns={3}
          data={videos}
          initialNumToRender={6} // Lazy loading for better performance
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => <VideoItem url={item.signedUrl} />}
          getItemLayout={(data, index) => ({
            length: 200,
            offset: 200 * index,
            index,
          })}
        />
      ) : (
        <Text className="text-gray-500 text-lg my-4">No videos available</Text>
      )}
    </SafeAreaView>
  );
}
