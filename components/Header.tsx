import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function Header() {
  const router = useRouter()
  return (
    <View className="flex-row items-center justify-between px-4 pb-4 border-b border-gray-300">
      <View className="flex-row items-center space-x-2">
        <Image
          source={{
            uri: 'https://i.ibb.co/t4ndgw7/1560911824827.jpg',
          }}
          className="h-10 w-10 bg-gray-300 rounded-full"
        />
        <View>
          <Text className="font-bold">Berl Treasure F. Campomanes</Text>
          <Text className="font-medium text-gray-500">Collector</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => router.push('/profile')}>
        <Ionicons
          name="options"
          size={34}
          color="black"
        />
      </TouchableOpacity>
    </View>
  )
}
