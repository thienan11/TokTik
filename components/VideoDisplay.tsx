import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

interface VideoItem {
  signedUrl: string;
}

export default function VideoDisplay({
  videoItem,
  isViewable,
}: {
  videoItem: VideoItem;
  isViewable: boolean;
}) {
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

  return (
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
  );
}
