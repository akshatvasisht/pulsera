import React from 'react'
import { render } from '@testing-library/react-native'
import { Text, View } from 'react-native'

// Simple component for testing setup
const TestComponent = () => (
  <View>
    <Text>Hello Pulsera</Text>
  </View>
)

describe('Basic Component Test', () => {
  it('renders correctly', () => {
    const { getByText } = render(<TestComponent />)
    expect(getByText('Hello Pulsera')).toBeTruthy()
  })
})
