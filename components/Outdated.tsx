import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

export default function Outdated() {
  return (
    <View className="h-full flex items-center justify-center">
      <View className="mx-4 flex items-center justify-center">
        <Text className="text-lg">Data are outdated, Sync is required.</Text>
        <Link href="/profile">
          <Text className="text-lg text-blue-600 font-medium">
            Go to Sync Page
          </Text>
        </Link>
      </View>
    </View>
  )
}
