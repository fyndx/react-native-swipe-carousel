import { Text, View, StyleSheet, Image } from 'react-native';
import { Carousel } from '@fyndx/react-native-swipe-carousel';
import { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type PicsumPhoto = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
  image: string;
};

const imageHeight = 200;
const imageWidth = 200;

export default function App() {
  const [items, setItems] = useState<PicsumPhoto[]>([]);
  const [selectedItem, setSelectedItem] = useState<PicsumPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('https://picsum.photos/v2/list?limit=5');
        const data: PicsumPhoto[] = await response.json();

        const transformedItems: PicsumPhoto[] = data.map((photo) => ({
          ...photo,
          image: photo.download_url,
        }));

        setItems(transformedItems);
        const firstItem = transformedItems[0];
        if (firstItem) {
          setSelectedItem(firstItem);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading || !selectedItem || items.length === 0) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{'Carousel'}</Text>
        </View>
        <Carousel
          items={items}
          selectedItem={selectedItem}
          onItemChange={(item) => setSelectedItem(item)}
          getItemId={(item) => item.id}
          renderItem={(item) => (
            <Image
              source={{ uri: item.image }}
              style={{
                width: imageWidth,
                height: imageHeight,
                borderRadius: imageHeight,
              }}
              resizeMode="cover"
            />
          )}
          renderDetail={(item) => (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>By {item.author}</Text>
              <Text>{item.download_url}</Text>
            </View>
          )}
          itemSize={imageHeight}
          gradientId="carousel-gradient"
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
});
