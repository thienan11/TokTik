import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { useEvent } from 'expo';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function Camera() {
  const { user } = useAuth();
  const router = useRouter();

  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const player = useVideoPlayer(videoUri, player => {
    player.loop = true;
    player.play();
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center pb-[10px]">We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const recordVideo = async () => {
    if (isRecording) {
      // if it is recording, stop recording
      setIsRecording(false);
      cameraRef.current?.stopRecording();
    } else {
      // if it is not recording, start recording
      setIsRecording(true);
      const video = await cameraRef.current?.recordAsync();
      setVideoUri(video.uri);
    }
  }

  const saveVideo = async () => {
    const formData = new FormData();
    const fileName = videoUri?.split('/').pop();
    formData.append('file', {
      uri: videoUri,
      type: `video/${fileName?.split('.').pop()}`,
      name: fileName,
    });

    // push form to Supabase
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, formData, {
        cacheControl: '3600000000', // won't be changed much once uploaded; want to cache it for a long period of time (save on storage cost)
        upsert: false
      });
    if (error) console.error(error);

    const { error: videoError } = await supabase.from('Video').insert({
      title: "Test title here!!",
      uri: data.path,
      user_id: user?.id
    });
    if (videoError) console.error(videoError);
    router.back();
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library (limited/private access only)
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
    });

    console.log(result);
    setVideoUri(result.assets[0].uri);
  };

  return (
    <View className="flex-1">
      {videoUri ? (
        <View className="flex-1">
          <TouchableOpacity className="absolute bottom-10 left-44 z-10" onPress={saveVideo}>
            <Ionicons name="checkmark-circle" size={100} color="white" />
          </TouchableOpacity>  
          {/* <TouchableOpacity className="flex-1"
            onPress={() => {
              if (isPlaying) {
                player.pause();
              } else {
                  player.play();
                }
              }}> */}
          <VideoView
            style={{
              flex: 1,
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height
            }}
            player={player}
            allowsFullscreen
            allowsPictureInPicture 
            contentFit='cover'
          />
          {/* </TouchableOpacity> */}
        </View>
      ) : 
        <CameraView mode="video" ref={cameraRef} style={{ flex: 1 }} facing={facing} ratio="4:3">
          <View className="flex-1 justify-end">
            <View className="flex-row items-center justify-around mb-10">
              <TouchableOpacity className="items-end justify-end" onPress={pickImage}>
                <Ionicons name="images" size={50} color="white"></Ionicons>
              </TouchableOpacity>

              {/* If there is a videoUri, show save video instead of record button */}
              {videoUri ? (
                <TouchableOpacity className="items-end justify-end" onPress={saveVideo}>
                  <Ionicons name="checkmark-circle" size={100} color="white" />
                </TouchableOpacity>  
              ) : (
                <TouchableOpacity className="items-end justify-end" onPress={recordVideo}>
                  { !isRecording ? <Ionicons name="radio-button-on" size={100} color="white" /> : <Ionicons name="pause-circle" size={100} color="red" /> }
                </TouchableOpacity>  
              )}

              <TouchableOpacity className="items-end justify-end" onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse" size={50} color="white"></Ionicons>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      }
    </View>
  );
}
