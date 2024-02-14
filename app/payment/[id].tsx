import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { SafeAreaView, Text, View, Button } from 'react-native'
import * as SQLite from 'expo-sqlite'
import { CollectionTypes } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import Loading from '@/components/Loading'
import Outdated from '@/components/Outdated'

export default function PaymentPage() {
  const [db, setDb] = useState(SQLite.openDatabase('lease.db'))
  const [isLoading, setIsLoading] = useState(false)
  const [syncRequired, setSyncRequired] = useState(false)
  const [collections, setCollections] = useState<CollectionTypes[] | []>([])

  const router = useRouter()
  const { id, name } = useLocalSearchParams()

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
    <SafeAreaView className="flex-1 items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <Stack.Screen options={{ headerTitle: `${name}` }} />
      <View>
        <Text>
          {name} {id} Collections:
        </Text>
      </View>
      {collections.map((item, index) => (
        <View key={index}>
          <Text>
            {item.amount} - {item.payment_mode}
          </Text>
        </View>
      ))}
      <Button
        onPress={() => router.back()}
        title="Back"
      />
    </SafeAreaView>
  )
}
