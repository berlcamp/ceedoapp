import 'react-native-url-polyfill/auto'
import { useState, useEffect, useRef } from 'react'
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import * as SQLite from 'expo-sqlite'
import { LocationTypes, TenantTypes } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import Loading from '@/components/Loading'
import Title from '@/components/Title'
import { AntDesign } from '@expo/vector-icons'
import BackgroundWrapper from '@/components/BackgroundWrapper'
import Outdated from '@/components/Outdated'

export default function SectionPage() {
  const [db, setDb] = useState(SQLite.openDatabase('lease.db'))
  const [isLoading, setIsLoading] = useState(false)
  const [syncRequired, setSyncRequired] = useState(false)
  const [tenants, setTenants] = useState<TenantTypes[] | []>([])
  const [filteredTenants, setFilteredTenants] = useState<TenantTypes[] | []>([])
  const [showSearchInput, setShowSearchInput] = useState(false)

  const { id, name }: { id: string; name: string } = useLocalSearchParams()
  const [searchInputValue, setSearchInputValue] = useState('')

  const textInputRef = useRef<TextInput | null>(null)
  const router = useRouter()

  const handleSearchInputChange = (text: string) => {
    // This function will be called whenever the text input changes
    setSearchInputValue(text)

    if (text.trim().length < 2) {
      setFilteredTenants(tenants)
      return
    }
    const searchWords = text.split(' ')
    const results = tenants.filter((tenant) => {
      const fullName = `${tenant.name}`.toLowerCase()
      return searchWords.every((word) => fullName.includes(word.toLowerCase()))
    })

    setFilteredTenants(results)
  }

  const handleClearSearch = () => {
    setFilteredTenants(tenants)
    setShowSearchInput(false)
  }

  const handleShowSearchInput = () => {
    setShowSearchInput(true)
    setSearchInputValue('')
    textInputRef.current?.focus()
  }

  const fetchTenants = async () => {
    setIsLoading(true)

    // Fetch rows from sqlite database
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM tenants WHERE section_id = '${id}'`,
        [],
        (_, { rows: { _array } }) => {
          setTenants(_array)
          setFilteredTenants(_array)
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
        fetchTenants()
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
          backTitle="Sections"
          title={name}
        />

        {tenants.length === 0 && (
          <View className="mx-4 mt-8 bg-gray-100 border border-white p-4 rounded-2xl">
            <Text>No tenants for {name} yet.</Text>
          </View>
        )}
        {tenants.length > 0 && (
          <>
            <View className="mx-4 mt-4 flex flex-row items-center justify-between">
              {showSearchInput ? (
                <View className="bg-gray-50 rounded-full pl-4 pr-2 pb-1 w-full flex flex-row items-center justify-between">
                  <TextInput
                    ref={textInputRef}
                    className="text-lg flex-1"
                    onChangeText={handleSearchInputChange}
                    value={searchInputValue}
                    placeholder="Search Tenant"
                  />
                  <TouchableOpacity onPress={handleClearSearch}>
                    <AntDesign
                      name="close"
                      size={22}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text className="font-medium text-gray-600">
                    Choose Tenant
                  </Text>
                  <TouchableOpacity onPress={handleShowSearchInput}>
                    <View className="p-2 bg-gray-50 border border-gray-300 rounded-full">
                      <AntDesign
                        name="search1"
                        size={14}
                        color="black"
                      />
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
            <ScrollView className="flex h-auto space-y-4 mx-4 my-2 bg-gray-100 border border-white p-4 rounded-2xl">
              {filteredTenants.length === 0 && (
                <View className="py-2 w-full">
                  <Text>No results found.</Text>
                </View>
              )}
              {filteredTenants.map((item, index) => (
                <View
                  key={index}
                  className="pb-2 border-b border-gray-300 w-full">
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: `/collections/location/section/tenant/${item.id}`,
                        params: { name: item.name },
                      })
                    }>
                    <View className="flex flex-row items-center space-x-2 w-full">
                      <View className="m-1">
                        <AntDesign
                          name="user"
                          size={34}
                          color="black"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-lg">{item.name}</Text>
                        <View className="flex flex-row items-center justify-between ">
                          <View className="flex flex-row ">
                            <Text className="font-medium text-sm text-gray-500">
                              Pass Due:
                            </Text>
                            <Text className="font-bold text-sm text-red-500">
                              1,000
                            </Text>
                          </View>
                          <View className="flex flex-row">
                            <Text className="font-medium text-sm text-gray-500">
                              Due on Feb 20:
                            </Text>
                            <Text className="font-bold text-sm text-green-500">
                              500
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </BackgroundWrapper>
  )
}
