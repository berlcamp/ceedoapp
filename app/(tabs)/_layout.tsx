import { Tabs } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { AntDesign } from '@expo/vector-icons'

export default function _layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="collections"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Feather
              name="list"
              size={24}
              color={color}
            />
          ),
          tabBarLabel: 'Collections',
          headerTitle: 'Collections',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <AntDesign
              name="user"
              size={24}
              color={color}
            />
          ),
          tabBarLabel: 'Profile',
          headerTitle: 'Profile',
        }}
      />
    </Tabs>
  )
}
