import React, { useEffect } from "react";
import { Dimensions, Text, View, TouchableOpacity, Share, Image } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/providers/AuthProvider";

interface User {
  username: string;
  id: string;
}

interface VideoItem {
  id: string;
  signedUrl: string;
  title: string;
  User: User;
}

export default function VideoDisplay({
  videoItem,
  isViewable,
}: {
  videoItem: VideoItem;
  isViewable: boolean;
}) {
  const { user, likes, getLikes, following, getFollowing } = useAuth();
  const router = useRouter();

  if (!videoItem) return null;

  const player = useVideoPlayer(videoItem.signedUrl, (player) => {
    player.loop = true;
    // player.play();
  });

  useEffect(() => {
    if (isViewable) {
      player.play();
    } else {
      player.pause();
    }
  }, [isViewable]);

  const shareVideo = () => {
    Share.share({
      message: `Check out this video: ${videoItem.title}`
    })
  };

  const likeVideo = async () => {
    const { data, error } = await supabase
      .from("Like")
      .insert({
        user_id: user?.id,
        video_id: videoItem.id,
        video_user_id: videoItem.User.id
      });
    if (!error) getLikes(user?.id);
    // console.log(videoItem);
  };

  const unlikeVideo = async () => {
    const { data, error } = await supabase
      .from("Like")
      .delete()
      .eq("user_id", user?.id)
      .eq("video_id", videoItem.id);
    if (!error) getLikes(user?.id);
  };

  const followerUser = async () => {
    const { error } = await supabase
      .from("Follower")
      .insert({
        user_id: user?.id, // we are taking the action so we want OUR user id
        follower_user_id: videoItem.User.id,
      });
    if (!error) getFollowing(user?.id);
  };

  const unFollowerUser = async () => {
    const { error } = await supabase
      .from("Follower")
      .delete()
      .eq("user_id", user?.id)
      .eq("follower_user_id", videoItem.User.id);
    if (!error) getFollowing(user?.id);
  };

  const isOwnProfile = user?.id === videoItem.User.id;

  return (
    <View>
      <VideoView
        style={{
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
        }}
        player={player}
        // allowsFullscreen
        // allowsPictureInPicture
        contentFit="cover"
        nativeControls={false}
      />
      <View className="absolute bottom-28 left-0 right-0">
        <View className="flex-1 flex-row items-end justify-between m-3">
          <View>
            <Text className="text-white text-2xl font-bold mt-18">{videoItem.User.username}</Text>
            <Text className="text-white text-xl font-semibold">{videoItem.title}</Text>
          </View>
          <View>
            <View>
              <TouchableOpacity onPress={() => router.push(`/user?user_id=${videoItem.User.id}`)}>
                {/* <Ionicons name="person" size={40} color="white" /> */}
                <Image
                    source={{
                      uri:
                        `${process.env.EXPO_PUBLIC_BUCKET}/avatars/${videoItem.User?.id}/avatar` ||
                        "https://placehold.co/40x40",
                    }}
                    className="w-12 h-12 rounded-full bg-black"
                  />
              </TouchableOpacity>
              {!isOwnProfile && (
                following.filter((following: any) => following.follower_user_id === videoItem.User.id).length > 0 ? (
                  <TouchableOpacity className="absolute -bottom-1 -right-1 bg-red-500 rounded-full items-center justify-content" onPress={unFollowerUser}>
                    <Ionicons name="remove" size={21} color="white"/>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity className="absolute -bottom-1 -right-1 bg-red-500 rounded-full items-center justify-content" onPress={followerUser}>
                    <Ionicons name="add" size={21} color="white"/>
                  </TouchableOpacity>
                )
              )}
            </View>
            {likes.filter((like: any) => like.video_id === videoItem.id).length > 0 ? (
              <TouchableOpacity className="mt-6" onPress={unlikeVideo}>
                <Ionicons name="heart" size={40} color="red" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="mt-6" onPress={likeVideo}>
                <Ionicons name="heart" size={40} color="white" />
              </TouchableOpacity>
            )}
            <TouchableOpacity className="mt-6" onPress={() => router.push(`/comment?video_id=${videoItem.id}&video_user_id=${videoItem.User.id}`)}>
              <Ionicons name="chatbubble-ellipses" size={40} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity className="mt-6" onPress={shareVideo}>
              <FontAwesome name="share" size={40} color="white"/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
