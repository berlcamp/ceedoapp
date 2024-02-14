import { View, Text } from 'react-native'
import React, { ReactNode } from 'react'
import { LinearGradient } from 'expo-linear-gradient'

interface MyComponentProps {
  children: ReactNode
}

const BackgroundWrapper: React.FC<MyComponentProps> = ({ children }) => {
  return (
    <LinearGradient
      colors={['#d5e1e8', '#eda33b']}
      className="h-full">
      {children}
    </LinearGradient>
  )
}
export default BackgroundWrapper
