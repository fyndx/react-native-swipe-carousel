import { useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';

import { scheduleOnRN } from 'react-native-worklets';

import { View, type ImageSourcePropType } from 'react-native';

// Type for pan gesture event payload
type PanGestureEvent = {
  translationX: number;
  velocityX: number;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

// Default values
const DEFAULT_ITEM_SIZE = 192;
const DEFAULT_ITEM_SPACING = 200;
const DEFAULT_MIN_SCALE = 0.7;
const DEFAULT_MAX_SCALE = 1.0;
const DEFAULT_GRADIENT_COLORS = ['orange', 'blue', 'violet'];
const DEFAULT_GRADIENT_ID = 'carousel-gradient';

// Animation configuration
const SPRING_DAMPING = 20;
const SPRING_STIFFNESS = 90;
const VELOCITY_THRESHOLD = 500;

// Opacity values for item interpolation
const MAX_OPACITY = 1;
const MIN_OPACITY = 0.6;

// Gradient border configuration
const GRADIENT_BORDER_PADDING = 8;
const GRADIENT_STROKE_WIDTH = 4;
const GRADIENT_RADIUS_OFFSET = 2;

// Layout spacing
const DETAIL_VIEW_MARGIN_TOP = 16;

// Gradient SVG configuration
const GRADIENT_STOP_OPACITY = '1';
const GRADIENT_START_X = '0%';
const GRADIENT_START_Y = '0%';
const GRADIENT_END_X = '100%';
const GRADIENT_END_Y = '100%';

// Type for image source - can be a URL string or local image source
export type ImageSource = string | ImageSourcePropType;

// Base type that items must extend - requires an image property
export type CarouselItemBase = {
  image: ImageSource;
};

type CarouselProps<T extends CarouselItemBase> = {
  items: T[];
  selectedItem: T;
  onItemChange: (item: T) => void;
  getItemId: (item: T) => string;
  renderItem: (
    item: T,
    index: number,
    translateX: SharedValue<number>
  ) => React.ReactNode;
  renderDetail?: (item: T) => React.ReactNode;
  itemSize?: number;
  itemSpacing?: number;
  minScale?: number;
  maxScale?: number;
  showGradientBorder?: boolean;
  gradientColors?: string[];
  gradientId?: string;
};

type GradientBorderProps = {
  itemSize: number;
  gradientColors: string[];
  gradientId: string;
};

function GradientBorder({
  itemSize,
  gradientColors,
  gradientId,
}: GradientBorderProps) {
  const gradientSize = itemSize + GRADIENT_BORDER_PADDING;
  const gradientCenter = gradientSize / 2;
  const gradientRadius = gradientCenter - GRADIENT_RADIUS_OFFSET;

  return (
    <View
      style={{
        position: 'absolute',
        width: gradientSize,
        height: gradientSize,
      }}
      pointerEvents="none"
    >
      <Svg width={gradientSize} height={gradientSize} testID="svg">
        <Defs>
          <SvgLinearGradient
            id={gradientId}
            x1={GRADIENT_START_X}
            y1={GRADIENT_START_Y}
            x2={GRADIENT_END_X}
            y2={GRADIENT_END_Y}
          >
            {gradientColors.map((color, index) => {
              const colorCount = gradientColors.length;
              const offset =
                colorCount === 1
                  ? '0%'
                  : `${(index / (colorCount - 1)) * 100}%`;
              return (
                <Stop
                  key={color}
                  offset={offset}
                  stopColor={color}
                  stopOpacity={GRADIENT_STOP_OPACITY}
                />
              );
            })}
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={gradientCenter}
          cy={gradientCenter}
          r={gradientRadius}
          stroke={`url(#${gradientId})`}
          strokeWidth={GRADIENT_STROKE_WIDTH}
          fill="none"
        />
      </Svg>
    </View>
  );
}

type CarouselItemProps<T extends CarouselItemBase> = {
  item: T;
  index: number;
  translateX: SharedValue<number>;
  itemSize: number;
  itemSpacing: number;
  minScale: number;
  maxScale: number;
  renderItem: (
    item: T,
    index: number,
    translateX: SharedValue<number>
  ) => React.ReactNode;
};

function CarouselItem<T extends CarouselItemBase>({
  item,
  index,
  translateX,
  itemSize,
  itemSpacing,
  minScale,
  maxScale,
  renderItem,
}: CarouselItemProps<T>) {
  const CENTER_X = SCREEN_WIDTH / 2;
  const CENTER_OFFSET = CENTER_X - itemSize / 2;

  const animatedStyle = useAnimatedStyle(() => {
    const basePosition = CENTER_OFFSET;
    const offset = index * itemSpacing;
    const position = basePosition + translateX.value + offset;

    const distanceFromCenter = Math.abs(position + itemSize / 2 - CENTER_X);
    const maxDistance = itemSpacing;

    const scale = interpolate(
      distanceFromCenter,
      [0, maxDistance],
      [maxScale, minScale],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      distanceFromCenter,
      [0, maxDistance],
      [MAX_OPACITY, MIN_OPACITY],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX: position }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
          width: itemSize,
          height: itemSize,
          left: 0,
          top: 0,
        },
        animatedStyle,
      ]}
    >
      {renderItem(item, index, translateX)}
    </Animated.View>
  );
}

export function Carousel<T extends CarouselItemBase>({
  items,
  selectedItem,
  onItemChange,
  getItemId,
  renderItem,
  renderDetail,
  itemSize = DEFAULT_ITEM_SIZE,
  itemSpacing = DEFAULT_ITEM_SPACING,
  minScale = DEFAULT_MIN_SCALE,
  maxScale = DEFAULT_MAX_SCALE,
  showGradientBorder = true,
  gradientColors = DEFAULT_GRADIENT_COLORS,
  gradientId = DEFAULT_GRADIENT_ID,
}: CarouselProps<T>) {
  const initialIndex = items.findIndex(
    (item) => getItemId(item) === getItemId(selectedItem)
  );
  const translateX = useSharedValue(-initialIndex * itemSpacing);
  const currentIndex = useSharedValue(initialIndex >= 0 ? initialIndex : 0);
  const previousItemId = useRef(getItemId(selectedItem));

  useEffect(() => {
    const currentItemId = getItemId(selectedItem);
    if (previousItemId.current !== currentItemId) {
      previousItemId.current = currentItemId;
      const index = items.findIndex(
        (item) => getItemId(item) === currentItemId
      );
      if (index !== -1) {
        currentIndex.value = index;
        translateX.value = withSpring(-index * itemSpacing, {
          damping: SPRING_DAMPING,
          stiffness: SPRING_STIFFNESS,
        });
      }
    }
  }, [selectedItem, items, currentIndex, translateX, getItemId, itemSpacing]);

  const snapToIndex = (index: number) => {
    'worklet';
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    translateX.value = withSpring(-clampedIndex * itemSpacing, {
      damping: SPRING_DAMPING,
      stiffness: SPRING_STIFFNESS,
    });
    currentIndex.value = clampedIndex;
  };

  const updateSelectedItem = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    const item = items[clampedIndex];
    if (item && getItemId(item) !== getItemId(selectedItem)) {
      onItemChange(item);
    }
  };

  const panGesture = Gesture.Pan()
    .withTestId('carousel-pan-gesture')
    .onUpdate((event: PanGestureEvent) => {
      const newTranslateX =
        -currentIndex.value * itemSpacing + event.translationX;
      const minTranslateX = -(items.length - 1) * itemSpacing;
      const maxTranslateX = 0;

      translateX.value = Math.max(
        minTranslateX,
        Math.min(maxTranslateX, newTranslateX)
      );
    })
    .onEnd((event: PanGestureEvent) => {
      const currentTranslateX = translateX.value;
      const velocity = event.velocityX;

      let targetIndex = Math.round(-currentTranslateX / itemSpacing);

      if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
        if (velocity < 0) {
          targetIndex = Math.min(targetIndex + 1, items.length - 1);
        } else {
          targetIndex = Math.max(targetIndex - 1, 0);
        }
      }

      snapToIndex(targetIndex);
      scheduleOnRN(updateSelectedItem, targetIndex);
    });

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <View
        style={{
          height: itemSize,
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={{
              position: 'absolute',
              width: SCREEN_WIDTH,
              height: itemSize,
            }}
          >
            {items.map((item, index) => (
              <CarouselItem
                key={getItemId(item)}
                item={item}
                index={index}
                translateX={translateX}
                itemSize={itemSize}
                itemSpacing={itemSpacing}
                minScale={minScale}
                maxScale={maxScale}
                renderItem={renderItem}
              />
            ))}
          </Animated.View>
        </GestureDetector>
        {showGradientBorder && (
          <GradientBorder
            itemSize={itemSize}
            gradientColors={gradientColors}
            gradientId={gradientId}
          />
        )}
      </View>
      {renderDetail && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: DETAIL_VIEW_MARGIN_TOP,
          }}
        >
          {renderDetail(selectedItem)}
        </View>
      )}
    </View>
  );
}
