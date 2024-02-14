import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/Auth'
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Session } from '@supabase/supabase-js'
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo'
import * as SQLite from 'expo-sqlite'
import {
  CollectionTypes,
  LocationTypes,
  SectionTypes,
  TenantTypes,
} from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import BackgroundWrapper from '@/components/BackgroundWrapper'
import Header from '@/components/Header'
import Title from '@/components/Title'

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [db, setDb] = useState(SQLite.openDatabase('lease.db'))
  const [isLoading, setIsLoading] = useState(false)
  const [locations, setLocations] = useState('')
  const [lastSync, setLastSync] = useState<string | null>(null)

  const handleSyncData = async () => {
    if (!isConnected) return

    setIsLoading(true)

    // Delete the tables first
    db.transaction((tx) => {
      tx.executeSql('DROP TABLE IF EXISTS locations')
    })
    db.transaction((tx) => {
      tx.executeSql('DROP TABLE IF EXISTS sections')
    })
    db.transaction((tx) => {
      tx.executeSql('DROP TABLE IF EXISTS tenants')
    })
    db.transaction((tx) => {
      tx.executeSql('DROP TABLE IF EXISTS collections')
    })

    // Then recreate the tables
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS locations (uid INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT, name TEXT) ',
      )
    })
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS sections (uid INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT, location_id TEXT, name TEXT) ',
      )
    })
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tenants (uid INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT, section_id TEXT, name TEXT, status TEXT) ',
      )
    })
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS collections (uid INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT, tenant_id TEXT, amount TEXT, payment_mode TEXT, payment_date TEXT) ',
      )
    })

    // Then sync the data
    await syncLocations()
    await syncSections()
    await syncTenants()
    await syncCollections()

    // Store date of last sync
    await AsyncStorage.setItem('last-sync', format(new Date(), 'yyyy-MM-dd'))

    setIsLoading(false)
  }

  // Sync Locations
  const syncLocations = async () => {
    // Pull data from supabase and insert the result to sqlite database
    const { data }: { data: LocationTypes[] | null } = await supabase
      .from('ceedo_locations')
      .select()

    if (data) {
      // Create insert statement
      let insertData = ''
      data.forEach((item, index) => {
        if (index === 0) {
          insertData += `SELECT '${item.id}' AS 'id', '${item.name}' AS 'name' `
        } else {
          insertData += `UNION SELECT '${item.id}', '${item.name}' `
        }
      })

      // Insert rows into the database
      db.transaction((tx) => {
        tx.executeSql(`INSERT INTO locations ('id', 'name') ${insertData}`)
      })
    }
  }

  // Sync Sections
  const syncSections = async () => {
    const { data }: { data: SectionTypes[] | null } = await supabase
      .from('ceedo_sections')
      .select()

    if (data) {
      // Create insert statement
      let insertData = ''
      data.forEach((item, index) => {
        if (index === 0) {
          insertData += `SELECT '${item.id}' AS 'id', '${item.location_id}' AS 'location_id', '${item.name}' AS 'name' `
        } else {
          insertData += `UNION SELECT '${item.id}', '${item.location_id}', '${item.name}' `
        }
      })

      // Insert rows into the database
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO sections ('id', 'location_id', 'name') ${insertData}`,
        )
      })
    }
  }

  // Sync Tenants
  const syncTenants = async () => {
    const { data }: { data: TenantTypes[] | null } = await supabase
      .from('ceedo_renters')
      .select()

    if (data) {
      // Create insert statement
      let insertData = ''
      data.forEach((item, index) => {
        if (index === 0) {
          insertData += `SELECT '${item.id}' AS 'id', '${item.section_id}' AS 'section_id', '${item.name}' AS 'name', '${item.status}' AS 'status' `
        } else {
          insertData += `UNION SELECT '${item.id}', '${item.section_id}', '${item.name}', '${item.status}' `
        }
      })

      // Insert rows into the database
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO tenants ('id', 'section_id', 'name', 'status') ${insertData}`,
        )
      })
    }
  }

  // Sync Collections
  const syncCollections = async () => {
    const { data }: { data: CollectionTypes[] | null } = await supabase
      .from('ceedo_collections')
      .select()

    if (data) {
      // Create insert statement
      let insertData = ''
      data.forEach((item, index) => {
        if (index === 0) {
          insertData += `SELECT '${item.id}' AS 'id', '${item.tenant_id}' AS 'tenant_id', '${item.amount}' AS 'amount', '${item.payment_mode}' AS 'payment_mode', '${item.payment_date}' AS 'payment_date' `
        } else {
          insertData += `UNION SELECT '${item.id}', '${item.tenant_id}', '${item.amount}', '${item.payment_mode}', '${item.payment_date}' `
        }
      })

      // Insert rows into the database
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO collections ('id', 'tenant_id', 'amount', 'payment_mode', 'payment_date') ${insertData}`,
        )
      })
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Get the latest sync date
    ;(async () => {
      const last_sync = await AsyncStorage.getItem('last-sync')
      setLastSync(last_sync)
    })()
  }, [])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected)
    })

    // Cleanup the subscription when the component is unmounted
    return () => unsubscribe()
  }, [])

  if (!isConnected) {
    return (
      <BackgroundWrapper>
        <View className="h-full flex items-center justify-center">
          <View className="mx-4">
            <Text className="text-lg">
              Device offline, please connect to internet.
            </Text>
          </View>
        </View>
      </BackgroundWrapper>
    )
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView>
        {session && session.user ? (
          <>
            <Header />
            <View className="mt-20 flex items-center justify-center">
              <View className="flex-row items-center justify-center">
                <TouchableOpacity
                  disabled={isLoading}
                  onPress={handleSyncData}>
                  <View className="mt-4 items-center text-lg bg-emerald-500 rounded-full">
                    <Text className="text-xl px-6 py-2 text-white font-bold">
                      Sync Data
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View className="mx-4 mt-2">
                {isLoading ? (
                  <View className="flex-row space-x-2 items-center justify-center">
                    <ActivityIndicator
                      size="large"
                      color="#0000ff"
                    />
                    <Text>Synchronizing data, please wait..</Text>
                  </View>
                ) : (
                  <Text>
                    {lastSync && (
                      <Text>
                        Latest Sync:{' '}
                        {format(new Date(lastSync), 'MMMM dd, yyyy')}
                      </Text>
                    )}
                  </Text>
                )}
              </View>
              <View className="mt-4 flex-row items-center justify-center">
                <TouchableOpacity disabled={isLoading}>
                  <View className="mt-4 items-center text-lg bg-blue-500 rounded-full">
                    <Text className="text-xl px-6 py-2 text-white font-bold">
                      Logout
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <Auth />
        )}
      </SafeAreaView>
    </BackgroundWrapper>
  )
}
