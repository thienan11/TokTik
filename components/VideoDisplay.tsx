import React, { useEffect } from "react";
import { Dimensions, Text, View, TouchableOpacity, Share } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface User {
  username: string;
  id: string;
}

interface VideoItem {
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
            <TouchableOpacity onPress={() => router.push(`/user?user_id=${videoItem.User.id}`)}>
              <Ionicons name="person" size={40} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="mt-6" onPress={() => console.log("Liked video")}>
              <Ionicons name="heart" size={40} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity className="mt-6" onPress={() => router.push('/comment')}>
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
