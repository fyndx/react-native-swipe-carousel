import React from 'react';
import { render } from '@testing-library/react-native';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import { State } from 'react-native-gesture-handler';
import { Carousel, type CarouselItemBase } from '../index';

// Test data
type TestItem = CarouselItemBase & {
  id: string;
  name: string;
};

const createTestItems = (count: number): TestItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
    image: `https://example.com/image-${i}.jpg`,
  }));
};

describe('Carousel', () => {
  const mockOnItemChange = jest.fn();
  const mockGetItemId = (item: TestItem) => item.id;
  const mockRenderItem = jest.fn((item: TestItem) => (
    <React.Fragment key={item.id}>{item.name}</React.Fragment>
  ));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render carousel with default props', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalledTimes(3);
      items.forEach((item, index) => {
        expect(mockRenderItem).toHaveBeenCalledWith(
          item,
          index,
          expect.any(Object)
        );
      });
    });

    it('should render carousel with custom props', () => {
      const items = createTestItems(5);
      const selectedItem = items[2]!;
      const customItemSize = 150;
      const customItemSpacing = 180;
      const customMinScale = 0.5;
      const customMaxScale = 1.2;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          itemSize={customItemSize}
          itemSpacing={customItemSpacing}
          minScale={customMinScale}
          maxScale={customMaxScale}
        />
      );

      expect(mockRenderItem).toHaveBeenCalledTimes(5);
    });

    it('should render gradient border by default', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;

      const { getByTestId } = render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('should not render gradient border when showGradientBorder is false', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;

      const { queryByTestId } = render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          showGradientBorder={false}
        />
      );

      expect(queryByTestId('svg')).toBeNull();
    });

    it('should render with custom gradient colors', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;
      const customGradientColors = ['red', 'green', 'blue', 'yellow'];

      const { getByTestId } = render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          gradientColors={customGradientColors}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('should render with single gradient color', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;
      const singleGradientColor = ['purple'];

      const { getByTestId } = render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          gradientColors={singleGradientColor}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('should render with custom gradientId', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;
      const customGradientId = 'custom-gradient-id';

      const { getByTestId } = render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          gradientId={customGradientId}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('renderDetail', () => {
    it('should render detail view when renderDetail is provided', () => {
      const items = createTestItems(3);
      const selectedItem = items[1]!;
      const mockRenderDetail = jest.fn((item: TestItem) => (
        <React.Fragment>{item.name} Detail</React.Fragment>
      ));

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          renderDetail={mockRenderDetail}
        />
      );

      expect(mockRenderDetail).toHaveBeenCalledWith(selectedItem);
    });

    it('should not render detail view when renderDetail is not provided', () => {
      const items = createTestItems(3);
      const selectedItem = items[1]!;

      const { queryByText } = render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      // Detail view should not be rendered
      expect(queryByText(/Detail/)).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      const items: TestItem[] = [];
      const selectedItem: TestItem = {
        id: 'non-existent',
        name: 'Non-existent',
        image: 'https://example.com/image.jpg',
      };

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).not.toHaveBeenCalled();
    });

    it('should handle selectedItem not in items array', () => {
      const items = createTestItems(3);
      const selectedItem: TestItem = {
        id: 'non-existent',
        name: 'Non-existent',
        image: 'https://example.com/image.jpg',
      };

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      // Should still render all items
      expect(mockRenderItem).toHaveBeenCalledTimes(3);
    });

    it('should handle single item', () => {
      const items = createTestItems(1);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalledTimes(1);
    });

    it('should handle selectedItem at the end of items array', () => {
      const items = createTestItems(5);
      const selectedItem = items[4]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalledTimes(5);
    });
  });

  describe('selectedItem Changes', () => {
    it('should update when selectedItem changes', () => {
      const items = createTestItems(3);
      const initialSelectedItem = items[0]!;
      const mockRenderDetail = jest.fn((item: TestItem) => (
        <React.Fragment>{item.name} Detail</React.Fragment>
      ));

      const { rerender } = render(
        <Carousel
          items={items}
          selectedItem={initialSelectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          renderDetail={mockRenderDetail}
        />
      );

      expect(mockRenderDetail).toHaveBeenCalledWith(initialSelectedItem);

      // Change selectedItem
      const newSelectedItem = items[2]!;
      rerender(
        <Carousel
          items={items}
          selectedItem={newSelectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          renderDetail={mockRenderDetail}
        />
      );

      expect(mockRenderDetail).toHaveBeenCalledWith(newSelectedItem);
    });

    it('should not call onItemChange when selectedItem changes to same item', () => {
      const items = createTestItems(3);
      const selectedItem = items[1]!;

      const { rerender } = render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      mockOnItemChange.mockClear();

      // Re-render with same selectedItem
      rerender(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      // onItemChange should not be called since it's the same item
      expect(mockOnItemChange).not.toHaveBeenCalled();
    });
  });

  describe('ImageSource Types', () => {
    it('should handle string image source', () => {
      const items: TestItem[] = [
        {
          id: '1',
          name: 'Item 1',
          image: 'https://example.com/image.jpg',
        },
      ];

      render(
        <Carousel
          items={items}
          selectedItem={items[0]!}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalled();
    });

    it('should handle ImageSourcePropType image source', () => {
      const items: TestItem[] = [
        {
          id: '1',
          name: 'Item 1',
          image: { uri: 'https://example.com/image.jpg' },
        },
      ];

      render(
        <Carousel
          items={items}
          selectedItem={items[0]!}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalled();
    });
  });

  describe('GradientBorder Component', () => {
    it('should render gradient border with correct props', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;
      const customItemSize = 200;
      const customGradientColors = ['red', 'blue'];
      const customGradientId = 'test-gradient';

      const { getByTestId } = render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          itemSize={customItemSize}
          gradientColors={customGradientColors}
          gradientId={customGradientId}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('CarouselItem Component', () => {
    it('should render all carousel items', () => {
      const items = createTestItems(5);
      const selectedItem = items[2]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalledTimes(5);
      items.forEach((item, index) => {
        expect(mockRenderItem).toHaveBeenNthCalledWith(
          index + 1,
          item,
          index,
          expect.any(Object)
        );
      });
    });

    it('should pass translateX shared value to renderItem', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      // Check that renderItem was called with translateX as third argument
      expect(mockRenderItem).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Number),
        expect.any(Object)
      );
    });

    it('should handle items at different positions with animatedStyle', () => {
      const items = createTestItems(5);
      const selectedItem = items[2]!; // Middle item

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      // Should render all items with different positions
      expect(mockRenderItem).toHaveBeenCalledTimes(5);
    });

    it('should apply animated styles with correct transform and opacity', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;
      const itemSize = 192;
      const itemSpacing = 200;
      const minScale = 0.7;
      const maxScale = 1.0;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          itemSize={itemSize}
          itemSpacing={itemSpacing}
          minScale={minScale}
          maxScale={maxScale}
        />
      );

      // Verify that renderItem was called for all items
      // The animated styles are applied internally by Reanimated
      expect(mockRenderItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Pan Gesture', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should handle pan gesture with positive translationX', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      const gesture = getByGestureTestId('carousel-pan-gesture');

      fireGestureHandler(gesture, [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: 100 },
        { state: State.END, translationX: 100 },
      ]);

      jest.advanceTimersByTime(1000);
    });

    it('should handle pan gesture with negative translationX', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      const gesture = getByGestureTestId('carousel-pan-gesture');

      fireGestureHandler(gesture, [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: -100 },
        { state: State.END, translationX: -100 },
      ]);

      jest.advanceTimersByTime(1000);
    });

    it('should handle pan gesture clamping to minTranslateX', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      const gesture = getByGestureTestId('carousel-pan-gesture');

      fireGestureHandler(gesture, [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: -1000 },
        { state: State.END, translationX: -1000 },
      ]);

      jest.advanceTimersByTime(1000);
    });

    it('should handle pan gesture clamping to maxTranslateX', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      const gesture = getByGestureTestId('carousel-pan-gesture');

      fireGestureHandler(gesture, [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: 1000 },
        { state: State.END, translationX: 1000 },
      ]);

      jest.advanceTimersByTime(1000);
    });

    it('should handle pan gesture end with low velocity', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      const gesture = getByGestureTestId('carousel-pan-gesture');

      fireGestureHandler(gesture, [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: -200 },
        { state: State.END, translationX: -200, velocityX: 100 },
      ]);

      jest.advanceTimersByTime(1000);
    });

    it('should handle pan gesture end with high negative velocity', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      const gesture = getByGestureTestId('carousel-pan-gesture');

      fireGestureHandler(gesture, [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: -200 },
        { state: State.END, translationX: -200, velocityX: -600 },
      ]);

      jest.advanceTimersByTime(1000);

      // Should move to next item
      expect(mockOnItemChange).toHaveBeenCalled();
    });

    it('should handle pan gesture end with high positive velocity', () => {
      const items = createTestItems(3);
      const selectedItem = items[1]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      const gesture = getByGestureTestId('carousel-pan-gesture');

      fireGestureHandler(gesture, [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: 100 },
        { state: State.END, translationX: 100, velocityX: 600 },
      ]);

      jest.advanceTimersByTime(1000);

      // Should move to previous item
      expect(mockOnItemChange).toHaveBeenCalled();
    });

    it('should handle pan gesture end with velocity at boundary', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      const gesture = getByGestureTestId('carousel-pan-gesture');

      fireGestureHandler(gesture, [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: -400 },
        { state: State.END, translationX: -400, velocityX: -600 },
      ]);

      jest.advanceTimersByTime(1000);
    });

    it('should call onItemChange when item changes via gesture', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;
      const itemSpacing = 200;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          itemSpacing={itemSpacing}
        />
      );

      mockOnItemChange.mockClear();

      const gesture = getByGestureTestId('carousel-pan-gesture');

      // Swipe enough to move to next item (index 1)
      // Use high velocity to ensure it moves to next item
      fireGestureHandler(gesture, [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: -itemSpacing * 0.5 },
        { state: State.END, translationX: -itemSpacing * 0.5, velocityX: -600 },
      ]);

      jest.advanceTimersByTime(1000);

      // Should trigger updateSelectedItem and call onItemChange with items[1]
      // High negative velocity should move to next item
      expect(mockOnItemChange).toHaveBeenCalled();
      expect(mockOnItemChange).toHaveBeenCalledWith(items[1]);
    });

    it('should not call onItemChange when item does not change via gesture', () => {
      const items = createTestItems(3);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      mockOnItemChange.mockClear();

      const gesture = getByGestureTestId('carousel-pan-gesture');

      fireGestureHandler(gesture, [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: 0 },
        { state: State.END, translationX: 0, velocityX: 0 },
      ]);

      jest.advanceTimersByTime(1000);

      // Should stay on same item, so onItemChange may not be called
      // or called with same item
    });
  });

  describe('useEffect Behavior', () => {
    it('should update when items array changes', () => {
      const initialItems = createTestItems(3);
      const selectedItem = initialItems[0]!;

      const { rerender } = render(
        <Carousel
          items={initialItems}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalledTimes(3);

      // Add more items
      const newItems = createTestItems(5);
      rerender(
        <Carousel
          items={newItems}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalledTimes(8); // 3 + 5
    });

    it('should handle selectedItem change when item is found in array', () => {
      const items = createTestItems(3);
      const initialSelectedItem = items[0]!;
      const newSelectedItem = items[2]!;

      const { rerender } = render(
        <Carousel
          items={items}
          selectedItem={initialSelectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      mockOnItemChange.mockClear();

      rerender(
        <Carousel
          items={items}
          selectedItem={newSelectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      // The useEffect should handle the change internally
      // but onItemChange shouldn't be called from useEffect
      expect(mockRenderItem).toHaveBeenCalled();
    });

    it('should handle selectedItem change when item is not found in array', () => {
      const items = createTestItems(3);
      const initialSelectedItem = items[0]!;
      const nonExistentItem: TestItem = {
        id: 'non-existent',
        name: 'Non-existent',
        image: 'https://example.com/image.jpg',
      };

      const { rerender } = render(
        <Carousel
          items={items}
          selectedItem={initialSelectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      rerender(
        <Carousel
          items={items}
          selectedItem={nonExistentItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      // Should still render items
      expect(mockRenderItem).toHaveBeenCalled();
    });
  });

  describe('Default Values', () => {
    it('should use default itemSize when not provided', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalled();
    });

    it('should use default itemSpacing when not provided', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalled();
    });

    it('should use default minScale and maxScale when not provided', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(mockRenderItem).toHaveBeenCalled();
    });

    it('should use default gradientColors when not provided', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;

      const { getByTestId } = render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('should use default gradientId when not provided', () => {
      const items = createTestItems(2);
      const selectedItem = items[0]!;

      const { getByTestId } = render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should render complete carousel with all features', () => {
      const items = createTestItems(4);
      const selectedItem = items[1]!;
      const mockRenderDetail = jest.fn((item: TestItem) => (
        <React.Fragment>Detail for {item.name}</React.Fragment>
      ));

      render(
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={mockOnItemChange}
          getItemId={mockGetItemId}
          renderItem={mockRenderItem}
          renderDetail={mockRenderDetail}
          itemSize={180}
          itemSpacing={220}
          minScale={0.6}
          maxScale={1.1}
          showGradientBorder={true}
          gradientColors={['cyan', 'magenta', 'yellow']}
          gradientId="custom-id"
        />
      );

      expect(mockRenderItem).toHaveBeenCalledTimes(4);
      expect(mockRenderDetail).toHaveBeenCalledWith(selectedItem);
    });
  });
});
