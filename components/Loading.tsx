import { View, ActivityIndicator } from 'react-native'

export default function Loading() {
  return (
    <View className="h-full flex items-center justify-center">
      <ActivityIndicator
        size="large"
        color="#0000ff"
      />
    </View>
  )
}
