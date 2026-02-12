import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Simple component for testing setup
const TestComponent = () => (
\u003cView\u003e
\u003cText\u003eHello Pulsera\u003c / Text\u003e
\u003c / View\u003e
);

describe('Basic Component Test', () => {
    it('renders correctly', () => {
        const { getByText } = render(\u003cTestComponent /\u003e);
        expect(getByText('Hello Pulsera')).toBeTruthy();
    });
});
