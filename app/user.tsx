import { Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from "@/providers/AuthProvider";
import { useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';

export default function () {
  const params = useLocalSearchParams();
  console.log(params);

  return (
    <SafeAreaView>
      <Header title="Username" color="black" goBack/>
      <Text className='text-black font-bold text-xl text-center'>Profile Here</Text>
    </SafeAreaView>
  );
}