import { View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

interface PageProps {
  backTitle?: string
  title: string
}

export default function Title({ backTitle, title }: PageProps) {
  const router = useRouter()

  return (
    <View className="flex-row items-center justify-center relative px-2 my-2">
      {backTitle && (
        <TouchableOpacity
          className="absolute left-0 flex-row items-center"
          onPress={() => router.back()}>
          <Feather
            name="chevron-left"
            size={28}
            color="black"
          />
          <Text className="text-lg text-gray-700 font-medium">{backTitle}</Text>
        </TouchableOpacity>
      )}
      <Text className="text-lg font-bold text-gray-800">{title}</Text>
    </View>
  )
}
