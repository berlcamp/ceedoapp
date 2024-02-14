import { Stack } from 'expo-router'

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="payment/[id]"
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack>
  )
}
