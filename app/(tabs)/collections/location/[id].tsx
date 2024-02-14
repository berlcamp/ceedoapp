import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import * as SQLite from 'expo-sqlite'
import { LocationTypes } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import Loading from '@/components/Loading'
import Title from '@/components/Title'
import BackgroundWrapper from '@/components/BackgroundWrapper'
import Outdated from '@/components/Outdated'

export default function LocationPage() {
  const [db, setDb] = useState(SQLite.openDatabase('lease.db'))
  const [isLoading, setIsLoading] = useState(false)
  const [syncRequired, setSyncRequired] = useState(false)
  const [sections, setSections] = useState<LocationTypes[] | []>([])

  const router = useRouter()
  const { id, name }: { id: string; name: string } = useLocalSearchParams()

  const fetchSections = async () => {
    setIsLoading(true)

    // Fetch rows from sqlite database
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM sections WHERE location_id = '${id}'`,
        [],
        (_, { rows: { _array } }) => {
          setSections(_array)
        },
      )
    })

    setIsLoading(false)
  }

  useEffect(() => {
    // Get the latest sync date
    ;(async () => {
      const last_sync = await AsyncStorage.getItem('last-sync')
      if (last_sync !== format(new Date(), 'yyyy-MM-dd')) {
        setSyncRequired(true)
      } else {
        fetchSections()
      }
    })()
  }, [])

  if (syncRequired) {
    return <Outdated />
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView>
        <Stack.Screen
          options={{
            headerTitle: 'Collections',
            headerShown: false,
          }}
        />
        <Title
          backTitle="Home"
          title={name}
        />
        <View className="mx-4 mt-4">
          <Text className="font-medium text-gray-600">Choose Section</Text>
        </View>
        <View className="flex flex-row flex-wrap mx-2">
          {sections.map((item, index) => (
            <View
              key={index}
              className="w-1/2 p-2">
              <View className="bg-gray-100 border border-white p-2 rounded-xl">
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: `/collections/location/section/${item.id}`,
                      params: { name: item.name },
                    })
                  }>
                  <View className="flex space-y-2">
                    <View className="flex flex-row items-center w-full">
                      <Text className="font-medium text-gray-900 text-lg">
                        {item.name}
                      </Text>
                    </View>
                    <View className="flex flex-row items-center w-full">
                      <Text className="text-gray-700 text-xs">Tenants: </Text>
                      <Text className="text-green-500 font-bold text-xs">
                        15
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  )
}
