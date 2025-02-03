import { Text, View } from 'react-native';
import { useAuth } from "@/providers/AuthProvider";

export default function () {
  const { user } = useAuth();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className='text-black font-bold text-3xl'>Comment</Text>
    </View>
  );
}
