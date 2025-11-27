/* eslint-env jest */
require('react-native-reanimated').setUpTests();

// Mock react-native-svg for Reanimated testing
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  // Create mock SVG components that render as View
  const createMockComponent = (name) => {
    const MockComponent = (props) => {
      return React.createElement(View, {
        ...props,
        testID: props.testID || name,
      });
    };
    MockComponent.displayName = name;
    return MockComponent;
  };

  const Svg = createMockComponent('Svg');
  const Circle = createMockComponent('Circle');
  const Defs = createMockComponent('Defs');
  const LinearGradient = createMockComponent('LinearGradient');
  const Stop = createMockComponent('Stop');

  return {
    __esModule: true,
    default: Svg,
    Svg: Svg,
    Circle: Circle,
    Defs: Defs,
    LinearGradient: LinearGradient,
    Stop: Stop,
  };
});

// Mock Dimensions
const { Dimensions } = require('react-native');
const mockDimensions = {
  window: {
    width: 375,
    height: 812,
  },
};

jest.spyOn(Dimensions, 'get').mockReturnValue(mockDimensions);

// Mock react-native-worklets scheduleOnRN to execute synchronously in tests
jest.mock('react-native-worklets', () => {
  const actualModule = jest.requireActual('react-native-worklets');
  return {
    ...actualModule,
    scheduleOnRN: jest.fn((fn, ...args) => {
      // Execute synchronously in tests
      if (typeof fn === 'function') {
        fn(...args);
      }
    }),
  };
});
