import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ClothingItem = {
  id: string;
  uri: string;
  category: string;
  clothingType?: string;
  color?: string;
  style?: string;
  description?: string;
};
const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function analyzeClothing(imageUri: string) {
  if (!API_URL) {
    throw new Error('API URL missing. Check your frontend .env file.');
  }

  const imageResponse = await fetch(imageUri);
  const imageBlob = await imageResponse.blob();

  const formData = new FormData();
  formData.append('file', imageBlob, 'clothing.jpg');

  const response = await fetch(`${API_URL}/analyze-clothing`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'AI analysis failed');
  }

  return data.analysis;
}

const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Other'];

export default function WardrobeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  useEffect(() => {
  async function loadClothes() {
    try {
      const saved = await AsyncStorage.getItem('styleai-wardrobe');
      if (saved) {
        setClothes(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Could not load wardrobe:', error);
    }
  }

  loadClothes();
}, []);

useEffect(() => {
  AsyncStorage.setItem('styleai-wardrobe', JSON.stringify(clothes))
    .catch((error) => console.error('Could not save wardrobe:', error));
}, [clothes]);

async function addClothes() {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const originalUri = result.assets[0].uri;

const imageResponse = await fetch(originalUri);
const imageBlob = await imageResponse.blob();

const uri: string = await new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onloadend = () => {
    if (typeof reader.result === 'string') {
      resolve(reader.result);
    } else {
      reject(new Error('Could not convert image'));
    }
  };

  reader.onerror = () => reject(new Error('Image conversion failed'));

  reader.readAsDataURL(imageBlob);
});

    let newItem: ClothingItem = {
      id: `${Date.now()}-${Math.random()}`,
      uri,
      category: selectedCategory === 'All' ? 'Other' : selectedCategory,
    };

    const localCategory =
  selectedCategory === 'All' ? 'Other' : selectedCategory;

newItem = {
  ...newItem,
  category: localCategory,
  clothingType:
    localCategory === 'Tops'
      ? 'Top'
      : localCategory === 'Bottoms'
        ? 'Bottom'
        : localCategory === 'Dresses'
          ? 'Dress'
          : localCategory === 'Shoes'
            ? 'Shoes'
            : 'Clothing item',
  color: 'Not detected',
  style: 'Not detected',
  description: 'Added to your digital wardrobe',
};

Alert.alert(
  'Clothing Added',
  `Category: ${newItem.category}\nType: ${newItem.clothingType}`
);

    setClothes((previous) => [newItem, ...previous]);
  } catch (error) {
    console.error('Unable to add clothing:', error);
    Alert.alert('Unable to open photos', 'Please try again.');
  }
}
  function deleteClothes(id: string) {
    setClothes((previous) => previous.filter((item) => item.id !== id));
  }

  const visibleClothes =
    selectedCategory === 'All'
      ? clothes
      : clothes.filter((item) => item.category === selectedCategory);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/')} style={styles.back}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>style<Text style={styles.accent}>AI</Text></Text>
            <Text style={styles.tagline}>YOUR DIGITAL CLOSET</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>YOUR PERSONAL COLLECTION</Text>
        <Text style={styles.title}>My Wardrobe</Text>
        <Text style={styles.subtitle}>
          Every piece you own. Endless ways to style it.
        </Text>

        <View style={styles.summary}>
          <Text style={styles.summaryNumber}>{clothes.length}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Pieces in your closet</Text>
            <Text style={styles.summaryText}>
              Start building your personal fashion collection.
            </Text>
          </View>
          <Text style={styles.summaryIcon}>♧</Text>
        </View>

        <Pressable style={styles.addButton} onPress={addClothes}>
          <Text style={styles.addButtonText}>＋  Add clothes from photos</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Browse categories</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.chip,
                selectedCategory === category && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === category && styles.chipTextActive,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {visibleClothes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👗</Text>
            <Text style={styles.emptyTitle}>
              {selectedCategory === 'All'
                ? 'Your closet starts here'
                : `No ${selectedCategory.toLowerCase()} yet`}
            </Text>
            <Text style={styles.emptyText}>
              Add a photo of your clothes to start creating your digital
              wardrobe.
            </Text>
            <Pressable style={styles.emptyButton} onPress={addClothes}>
              <Text style={styles.emptyButtonText}>＋ Add your first piece</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {visibleClothes.map((item) => (
              <View key={item.id} style={styles.item}>
                <Image source={{ uri: item.uri }} style={styles.photo} />
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteClothes(item.id)}
                >
                  <Text style={styles.deleteText}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>STYLE STARTS WITH YOU ✦</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF7F2' },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 22,
    paddingBottom: 45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 35,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFE4DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 25, color: '#A45D45' },
  brand: { fontSize: 25, fontWeight: '800', color: '#28231F' },
  accent: { color: '#A45D45' },
  tagline: { fontSize: 9, letterSpacing: 2, color: '#8B8179' },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    color: '#A45D45',
    marginBottom: 10,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#28231F' },
  subtitle: {
    fontSize: 13,
    color: '#8B8179',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 25,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#EFE4DB',
    borderRadius: 18,
    padding: 18,
    marginBottom: 17,
  },
  summaryNumber: { fontSize: 35, fontWeight: '800', color: '#A45D45' },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: '#28231F' },
  summaryText: { fontSize: 11, color: '#8B8179', marginTop: 5 },
  summaryIcon: { fontSize: 28, color: '#A45D45' },
  addButton: {
    backgroundColor: '#342B28',
    padding: 17,
    alignItems: 'center',
    borderRadius: 13,
    marginBottom: 30,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#28231F',
    marginBottom: 14,
  },
  categories: { gap: 8, paddingBottom: 20 },
  chip: {
    borderWidth: 1,
    borderColor: '#EDE5DE',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  chipActive: { backgroundColor: '#342B28', borderColor: '#342B28' },
  chipText: { color: '#8B8179', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  empty: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EDE5DE',
    padding: 28,
    marginTop: 5,
  },
  emptyIcon: { fontSize: 55, marginBottom: 15 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#28231F',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#8B8179',
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 9,
  },
  emptyButton: {
    backgroundColor: '#EFE4DB',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 18,
  },
  emptyButtonText: { color: '#A45D45', fontWeight: '700', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '42%',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EDE5DE',
  },
  photo: { width: '100%', height: 155, borderRadius: 10, backgroundColor: '#EFE4DB' },
  itemCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#28231F',
    marginTop: 10,
  },
  deleteButton: { paddingVertical: 8 },
  deleteText: { color: '#A45D45', fontSize: 11, fontWeight: '600' },
  footer: {
    textAlign: 'center',
    color: '#8B8179',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 35,
  },
});
