import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import * as SQLite from 'expo-sqlite'
import { CollectionTypes } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import Loading from '@/components/Loading'
import Title from '@/components/Title'
import { AntDesign, Feather } from '@expo/vector-icons'
import BackgroundWrapper from '@/components/BackgroundWrapper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Outdated from '@/components/Outdated'

export default function TenantPage() {
  const [db, setDb] = useState(SQLite.openDatabase('lease.db'))
  const [isLoading, setIsLoading] = useState(false)
  const [syncRequired, setSyncRequired] = useState(false)
  const [collections, setCollections] = useState<CollectionTypes[] | []>([])

  const router = useRouter()

  const { id, name }: { id: string; name: string } = useLocalSearchParams()

  const fetchCollections = async () => {
    setIsLoading(true)

    // Fetch rows from sqlite database
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM collections WHERE tenant_id = '${id}'`,
        [],
        (_, { rows: { _array } }) => {
          setCollections(_array)
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
        fetchCollections()
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
            headerTitle: 'Tenant',
            headerShown: false,
          }}
        />
        <Title
          backTitle="Back"
          title=""
        />
        <View className="mt-10 px-4">
          <View className="flex-row items-center space-x-2">
            <View className="m-1">
              <AntDesign
                name="user"
                size={34}
                color="black"
              />
            </View>
            <View>
              <Text className="font-bold text-base">
                {name} Berl Treasure F. Campomanes
              </Text>
              <Text className="font-medium text-gray-500">Tenant</Text>
            </View>
          </View>
        </View>
        <View className="mt-6 flex flex-row items-center justify-end px-4">
          <View className="rounded-lg bg-green-500 border border-gray-100 px-2 py-1">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: `/payment/${id}`,
                  params: { name },
                })
              }>
              <Text className="text-white text-base font-bold">
                Collect Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mt-8 mx-4 bg-gray-100 border border-white rounded-2xl">
          <TouchableOpacity
            className="p-4 flex flex-row items-center justify-between"
            onPress={() =>
              router.push({
                pathname: `/collections/location/section/tenant/details/${id}`,
                params: { name },
              })
            }>
            <View className="flex flex-row items-center space-x-2">
              <AntDesign
                name="user"
                size={24}
                color="black"
              />
              <Text className="text-base text-gray-700 font-medium">
                Basic Details
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={28}
              color="blue"
            />
          </TouchableOpacity>
        </View>
        <View className="mt-4 mx-4 bg-gray-100 border border-white rounded-2xl">
          <TouchableOpacity
            className="p-4 flex flex-row items-center justify-between"
            onPress={() =>
              router.push({
                pathname: `/collections/location/section/tenant/details/${id}`,
                params: { name },
              })
            }>
            <View className="flex flex-row items-center space-x-2">
              <MaterialCommunityIcons
                name="currency-php"
                size={24}
                color="black"
              />
              <Text className="text-base text-gray-700 font-medium">
                Payment History
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={28}
              color="blue"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  )
}
