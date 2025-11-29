# @fyndx/react-native-swipe-carousel

A performant swipe carousel component for React Native built with `react-native-reanimated` and `react-native-gesture-handler`. Features smooth animations, gesture-based navigation, and customizable styling.

## Features

- 🎯 **Smooth Animations** - Powered by `react-native-reanimated` for 60fps animations
- 👆 **Gesture Support** - Swipe gestures with velocity-based snapping
- 🎨 **Customizable** - Custom item rendering, sizes, spacing, and gradient borders
- 📱 **TypeScript** - Full TypeScript support with generics
- ⚡ **Performant** - Optimized with worklets and shared values

## Installation

```sh
npm install @fyndx/react-native-swipe-carousel
```

### Demo

<video src="https://github.com/user-attachments/assets/1e39b148-fe8c-42e0-bfc7-96d9b7f46195" controls width="100%">
  Your browser does not support the video tag.
</video>

### Peer Dependencies

This library requires the following peer dependencies:

```sh
npm install react-native-gesture-handler react-native-reanimated react-native-svg react-native-worklets
```

Make sure to follow the setup instructions for:
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/installation)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/installation)

## Usage

### Basic Example

```tsx
import { Carousel } from '@fyndx/react-native-swipe-carousel';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState } from 'react';
import { Image, View, Text } from 'react-native';

type Item = {
  id: string;
  image: string;
  title: string;
};

const items: Item[] = [
  { id: '1', image: 'https://example.com/image1.jpg', title: 'Item 1' },
  { id: '2', image: 'https://example.com/image2.jpg', title: 'Item 2' },
  { id: '3', image: 'https://example.com/image3.jpg', title: 'Item 3' },
];

export default function App() {
  const [selectedItem, setSelectedItem] = useState<Item>(items[0]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Carousel
        items={items}
        selectedItem={selectedItem}
        onItemChange={setSelectedItem}
        getItemId={(item) => item.id}
        renderItem={(item) => (
          <Image
            source={{ uri: item.image }}
            style={{ width: 200, height: 200, borderRadius: 100 }}
          />
        )}
        renderDetail={(item) => (
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </GestureHandlerRootView>
  );
}
```

### Advanced Example

```tsx
<Carousel
  items={items}
  selectedItem={selectedItem}
  onItemChange={setSelectedItem}
  getItemId={(item) => item.id}
  renderItem={(item, index, translateX) => (
    <YourCustomItemComponent item={item} />
  )}
  renderDetail={(item) => <YourDetailView item={item} />}
  itemSize={250}
  itemSpacing={220}
  minScale={0.7}
  maxScale={1.0}
  showGradientBorder={true}
  gradientColors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
  gradientId="my-carousel-gradient"
/>
```

## API Reference

### `Carousel<T extends CarouselItemBase>`

The main carousel component.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `T[]` | Yes | - | Array of items to display in the carousel |
| `selectedItem` | `T` | Yes | - | Currently selected item |
| `onItemChange` | `(item: T) => void` | Yes | - | Callback fired when the selected item changes |
| `getItemId` | `(item: T) => string` | Yes | - | Function to extract a unique ID from an item |
| `renderItem` | `(item: T, index: number, translateX: SharedValue<number>) => React.ReactNode` | Yes | - | Function to render each carousel item |
| `renderDetail` | `(item: T) => React.ReactNode` | No | - | Optional function to render detail view below carousel |
| `itemSize` | `number` | No | `192` | Size (width/height) of each carousel item |
| `itemSpacing` | `number` | No | `200` | Horizontal spacing between items |
| `minScale` | `number` | No | `0.7` | Minimum scale for items away from center |
| `maxScale` | `number` | No | `1.0` | Maximum scale for the centered item |
| `showGradientBorder` | `boolean` | No | `true` | Whether to show gradient border around centered item |
| `gradientColors` | `string[]` | No | `['orange', 'blue', 'violet']` | Colors for the gradient border |
| `gradientId` | `string` | No | `'carousel-gradient'` | Unique ID for the SVG gradient (required if multiple carousels) |

#### Types

```tsx
// Base type that items must extend
type CarouselItemBase = {
  image: ImageSource; // string | ImageSourcePropType
};

// Image source type
type ImageSource = string | ImageSourcePropType;
```

## Features Explained

### Gesture Handling

The carousel responds to pan gestures:
- **Swipe left/right** to navigate between items
- **Velocity-based snapping** - fast swipes skip to adjacent items
- **Smooth spring animations** when snapping to items

### Animations

- **Scale animation**: Items scale from `minScale` to `maxScale` based on distance from center
- **Opacity animation**: Items fade from `MIN_OPACITY` (0.6) to `MAX_OPACITY` (1.0) based on position
- **Spring physics**: Uses configurable damping and stiffness for natural motion

### Gradient Border

The optional gradient border highlights the centered item with a customizable gradient stroke. You can:
- Toggle visibility with `showGradientBorder`
- Customize colors with `gradientColors` array
- Use unique `gradientId` when multiple carousels are present

## Notes

- Wrap your app (or carousel container) with `GestureHandlerRootView` from `react-native-gesture-handler`
- The `renderItem` function receives a `translateX` SharedValue that you can use for advanced animations
- Items must have an `image` property (can be a string URL or ImageSourcePropType)


## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
