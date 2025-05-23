import React, { useEffect, useState, useRef } from "react";
import { View, FlatList, Dimensions } from "react-native";
import { supabase } from "@/utils/supabase";
import VideoDisplay from "@/components/VideoDisplay";
import Header from "@/components/Header";
import { useIsFocused } from "@react-navigation/native";

export default function HomeScreen() {
  const [videos, setVideos] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    getVideos();
  }, []);

  const getVideos = async () => {
    const { data, error } = await supabase
      .from("Video")
      .select("*, User(username, id)")
      .order("created_at", { ascending: false });

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

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Item must be 50% visible to trigger
    minimumViewTime: 0,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].key);
      }
    }
  ).current;

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="absolute top-16 left-0 right-0 z-10">
        <Header title="For You" color="white" search />
      </View>
      <FlatList
        data={videos}
        snapToInterval={Dimensions.get("window").height}
        snapToStart
        decelerationRate="fast"
        // keyExtractor={(item) => item.id.toString()}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => (
          <VideoDisplay
            videoItem={item}
            isViewable={activeIndex === item.id && isFocused}
          />
        )}
      />
    </View>
  );
}
