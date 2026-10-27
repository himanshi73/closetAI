
import AsyncStorage from '@react-native-async-storage/async-storage';
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

type OutfitSuggestion = {
  id: string;
  title: string;
  description: string;
  items: ClothingItem[];
};

const WARDROBE_KEY = 'styleai-wardrobe';
const FAVOURITES_KEY = 'styleai-favourite-outfits';

const OCCASIONS = ['College', 'Office', 'Party', 'Casual'];

export default function StylistScreen() {
  const router = useRouter();

  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [occasion, setOccasion] = useState('College');
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([]);
  const [favourites, setFavourites] = useState<OutfitSuggestion[]>([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [wardrobeData, favouriteData] = await Promise.all([
          AsyncStorage.getItem(WARDROBE_KEY),
          AsyncStorage.getItem(FAVOURITES_KEY),
        ]);

        if (wardrobeData) {
          const parsed = JSON.parse(wardrobeData);
          if (Array.isArray(parsed)) setClothes(parsed);
        }

        if (favouriteData) {
          const parsed = JSON.parse(favouriteData);
          if (Array.isArray(parsed)) setFavourites(parsed);
        }
      } catch (error) {
        console.error('Could not load StyleAI data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function suggestOutfit() {
    const normalize = (value?: string) =>
      (value || '').trim().toLowerCase().replace(/[_-]/g, ' ');

    // Check both the selected wardrobe category and optional item type.
    const hasType = (item: ClothingItem, keywords: string[]) => {
      const values = [normalize(item.category), normalize(item.clothingType)];
      return values.some((value) =>
        keywords.some((keyword) => value === keyword || value.includes(keyword))
      );
    };

    const tops = clothes.filter((item) =>
      hasType(item, [
        'top', 'tops', 'shirt', 'shirts', 't shirt', 'tshirt', 'tee',
        'kurti', 'kurtis', 'blouse', 'sweater', 'jacket', 'hoodie',
      ])
    );

    const bottoms = clothes.filter((item) =>
      hasType(item, [
        'bottom', 'bottoms', 'jean', 'jeans', 'trouser', 'trousers',
        'pant', 'pants', 'skirt', 'leggings', 'shorts', 'palazzo',
      ])
    );

    const dresses = clothes.filter((item) =>
      hasType(item, ['dress', 'dresses', 'gown', 'jumpsuit', 'one piece'])
    );

    const shoes = clothes.filter((item) =>
      hasType(item, [
        'shoe', 'shoes', 'footwear', 'sneaker', 'heel', 'sandals',
        'flats', 'boot', 'slipper',
      ])
    );

    const results: OutfitSuggestion[] = [];
    const descriptions: Record<string, string> = {
      College: 'Comfortable pieces for a college day. Add a bag and simple accessories to finish the look.',
      Office: 'A neat, polished combination for work or an interview. Keep accessories simple.',
      Party: 'A party-ready combination. Add statement earrings or another accessory you like.',
      Casual: 'An easy everyday combination. Layer or accessorise it to suit the weather.',
    };

    // Create different top + bottom combinations, optionally adding shoes.
    const combinations: ClothingItem[][] = [];
    tops.forEach((top) => {
      bottoms.forEach((bottom) => {
        combinations.push([top, bottom]);
      });
    });

    // Rotate the order by occasion so the first suggestions vary by selection.
    const offset =
      occasion === 'Office' ? 1 :
      occasion === 'Party' ? 2 :
      occasion === 'Casual' ? 3 : 0;

    if (combinations.length > 0) {
      const start = offset % combinations.length;
      const rotated = [
        ...combinations.slice(start),
        ...combinations.slice(0, start),
      ];

      rotated.slice(0, 6).forEach((pair, index) => {
        const footwear = shoes.length ? [shoes[index % shoes.length]] : [];
        results.push({
          id: `combo-${occasion}-${pair[0].id}-${pair[1].id}`,
          title: `${occasion} Look ${index + 1}`,
          description: descriptions[occasion] || descriptions.Casual,
          items: [...pair, ...footwear],
        });
      });
    }

    // Dresses can be styled on their own, with shoes when available.
    dresses.slice(0, 4).forEach((dress, index) => {
      results.push({
        id: `dress-${occasion}-${dress.id}`,
        title: `${occasion} Dress Look ${index + 1}`,
        description: `${descriptions[occasion] || descriptions.Casual} Try this dress with the shoes shown, if available.`,
        items: [dress, ...(shoes.length ? [shoes[index % shoes.length]] : [])],
      });
    });

    // If the wardrobe doesn't yet contain a full combination, show saved pieces
    // and explain what item category would help complete an outfit.
    if (results.length === 0 && clothes.length > 0) {
      const suggestions: string[] = [];
      if (tops.length === 0 && dresses.length === 0) suggestions.push('a top or a dress');
      if (bottoms.length === 0 && dresses.length === 0) suggestions.push('a bottom such as jeans, trousers or a skirt');
      const missingText = suggestions.length
        ? ` To build a complete look, add ${suggestions.join(' and ')} to your wardrobe.`
        : ' Try categorising your saved clothes as Tops, Bottoms, Dresses or Shoes in your wardrobe.';

      results.push({
        id: `wardrobe-${occasion}-${clothes.map((item) => item.id).join('-')}`,
        title: 'Your Wardrobe Picks',
        description: `Here are some pieces you already own. Shoes and accessories can help finish the look.${missingText}`,
        items: clothes.slice(0, 4),
      });
    }

    setShowFavourites(false);
    setOutfits(results);
  }

  async function toggleFavourite(outfit: OutfitSuggestion) {
    const alreadySaved = favourites.some((item) => item.id === outfit.id);

    const updated = alreadySaved
      ? favourites.filter((item) => item.id !== outfit.id)
      : [...favourites, outfit];

    try {
      await AsyncStorage.setItem(
        FAVOURITES_KEY,
        JSON.stringify(updated)
      );
      setFavourites(updated);
    } catch (error) {
      console.error('Could not save favourite:', error);
      Alert.alert('Error', 'Favourite save nahi ho paya. Dobara try karo.');
    }
  }

  const displayedOutfits = showFavourites ? favourites : outfits;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable onPress={() => router.replace('/')} style={styles.back}>
        <Text style={styles.backText}>← Home</Text>
      </Pressable>

      <Text style={styles.brand}>STYLEAI ✨</Text>
      <Text style={styles.title}>Your AI Stylist</Text>
      <Text style={styles.subtitle}>
        Your wardrobe, your occasion, your style.
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{clothes.length}</Text>
          <Text style={styles.statLabel}>Wardrobe Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{favourites.length}</Text>
          <Text style={styles.statLabel}>Favourites ❤️</Text>
        </View>
      </View>

      <Text style={styles.label}>Choose your occasion</Text>

      <View style={styles.choices}>
        {OCCASIONS.map((item) => (
          <Pressable
            key={item}
            onPress={() => {
              setOccasion(item);
              setOutfits([]);
              setShowFavourites(false);
            }}
            style={[
              styles.chip,
              occasion === item && styles.selected,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                occasion === item && styles.selectedText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👗 Your Outfit Studio</Text>
        <Text style={styles.body}>
          Choose an occasion and create looks using your saved clothing photos.
        </Text>

        <Pressable
          style={styles.button}
          onPress={suggestOutfit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading wardrobe...' : '✨ Suggest My Outfit'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.favouriteButton}
          onPress={() => {
            setShowFavourites(!showFavourites);
            setOutfits([]);
          }}
        >
          <Text style={styles.favouriteButtonText}>
            {showFavourites ? '← Back to Suggestions' : '❤️ View Favourite Outfits'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>
        {showFavourites ? '❤️ Your Favourite Looks' : '✨ Outfit Suggestions'}
      </Text>

      {displayedOutfits.map((outfit, index) => {
        const saved = favourites.some((item) => item.id === outfit.id);

        return (
          <View key={`${outfit.id}-${index}`} style={styles.outfitCard}>
            <View style={styles.outfitHeader}>
              <View style={styles.outfitHeading}>
                <Text style={styles.outfitTitle}>{outfit.title}</Text>
                <Text style={styles.outfitDescription}>
                  {outfit.description}
                </Text>
              </View>

              <Pressable
                onPress={() => toggleFavourite(outfit)}
                style={styles.heartButton}
                accessibilityLabel={
                  saved ? 'Remove favourite' : 'Save favourite'
                }
              >
                <Text style={styles.heart}>
                  {saved ? '❤️' : '🤍'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.photoRow}>
              {(Array.isArray(outfit.items) ? outfit.items : []).map(
                (item, itemIndex) => (
                  <View
                    key={`${item.id}-${itemIndex}`}
                    style={styles.photoItem}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                    <Text style={styles.category}>
                      {item.category || 'Clothing'}
                    </Text>
                  </View>
                )
              )}
            </View>

            <Text style={styles.tip}>
              💡 Tip: Try these pieces together and adjust accessories to suit your style.
            </Text>
          </View>
        );
      })}

      {!loading && displayedOutfits.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>
            {showFavourites ? '❤️' : '🧥'}
          </Text>
          <Text style={styles.emptyTitle}>
            {showFavourites
              ? 'No favourites saved yet'
              : clothes.length === 0
              ? 'Your wardrobe is waiting!'
              : 'Your next look starts here'}
          </Text>
          <Text style={styles.body}>
            {showFavourites
              ? 'Generate an outfit and tap the heart to save it here.'
              : clothes.length === 0
              ? 'Add clothing photos to your wardrobe before generating looks.'
              : 'Tap Suggest My Outfit to see combinations from your wardrobe.'}
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => router.push('/wardrobe')}
        style={styles.secondary}
      >
        <Text style={styles.secondaryText}>
          ＋ Add Clothes to My Wardrobe
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        StyleAI • Your personal style companion
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FAF4EC',
  },
  content: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  back: {
    marginBottom: 24,
  },
  backText: {
    color: '#70452F',
    fontSize: 16,
    fontWeight: '600',
  },
  brand: {
    color: '#9B6A4A',
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#38251D',
    marginTop: 12,
  },
  subtitle: {
    color: '#846D60',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 26,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  statNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: '#70452F',
  },
  statLabel: {
    color: '#846D60',
    fontSize: 12,
    marginTop: 4,
  },
  label: {
    color: '#38251D',
    fontWeight: '700',
    marginBottom: 12,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#EFE3D6',
  },
  selected: {
    backgroundColor: '#70452F',
  },
  chipText: {
    color: '#70452F',
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    marginBottom: 24,
  },
  cardTitle: {
    color: '#38251D',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    color: '#846D60',
    lineHeight: 23,
  },
  button: {
    backgroundColor: '#70452F',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  favouriteButton: {
    borderWidth: 1,
    borderColor: '#D8BDA9',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  favouriteButtonText: {
    color: '#70452F',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 21,
    color: '#38251D',
    fontWeight: '800',
    marginBottom: 14,
  },
  outfitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  outfitHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  outfitHeading: {
    flex: 1,
  },
  outfitTitle: {
    color: '#38251D',
    fontSize: 18,
    fontWeight: '700',
  },
  outfitDescription: {
    color: '#846D60',
    lineHeight: 21,
    marginTop: 7,
  },
  heartButton: {
    padding: 6,
  },
  heart: {
    fontSize: 25,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  photoItem: {
    width: '47%',
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#EFE4DB',
  },
  category: {
    color: '#70452F',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 7,
    textTransform: 'capitalize',
  },
  tip: {
    color: '#846D60',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: '#F0E5D9',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 4,
  },
  emptyEmoji: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#38251D',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  secondary: {
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryText: {
    color: '#70452F',
    fontWeight: '700',
  },
  footer: {
    color: '#9B887B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});
