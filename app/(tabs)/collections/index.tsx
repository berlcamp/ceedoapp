import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import * as SQLite from 'expo-sqlite'
import { LocationTypes } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import { Link, Stack, useRouter } from 'expo-router'
import Loading from '@/components/Loading'
import Header from '@/components/Header'
import Title from '@/components/Title'
import BackgroundWrapper from '@/components/BackgroundWrapper'
import Outdated from '@/components/Outdated'

export default function CollectionsPage() {
  const [db, setDb] = useState(SQLite.openDatabase('lease.db'))
  const [isLoading, setIsLoading] = useState(false)
  const [syncRequired, setSyncRequired] = useState(false)
  const [locations, setLocations] = useState<LocationTypes[] | []>([])

  const router = useRouter()

  const fetchLocations = async () => {
    setIsLoading(true)

    // Fetch rows from sqlite database
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM locations`,
        [],
        (_, { rows: { _array } }) => {
          setLocations(_array)
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
        setSyncRequired(false)
        fetchLocations()
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
        <Stack.Screen options={{ headerShown: false }} />
        <Header />
        <Title title="Locations" />
        <View className="mx-4 mt-4">
          <Text className="font-medium text-gray-600">Choose Location</Text>
        </View>
        <View className="flex flex-row flex-wrap mx-2">
          {locations.map((item, index) => (
            <View
              key={index}
              className="w-1/2 p-2">
              <View className="bg-gray-100 border border-white p-2 rounded-xl">
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: `/collections/location/${item.id}`,
                      params: { name: item.name },
                    })
                  }>
                  <View className="flex space-y-2">
                    <View className="flex flex-row items-center w-full">
                      <Text className="font-medium text-gray-900 text-xl">
                        {item.name}
                      </Text>
                    </View>
                    <View className="flex flex-row items-center w-full">
                      <Text className="text-gray-700 text-xs">Sections: </Text>
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
