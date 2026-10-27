import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const COLORS = {
  background: '#FAF7F2',
  card: '#FFFFFF',
  dark: '#28231F',
  muted: '#8B8179',
  accent: '#A45D45',
  light: '#EFE4DB',
  border: '#EDE5DE',
};

const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes'];

const outfits = [
  {
    emoji: '👚',
    name: 'Everyday Chic',
    details: 'Casual · Comfortable',
    colors: '#F0E3D7',
    tags: ['Tops', 'Bottoms'],
  },
  {
    emoji: '👗',
    name: 'Elegant Evening',
    details: 'Dinner · Special occasions',
    colors: '#E9DDE3',
    tags: ['Dresses'],
  },
  {
    emoji: '👖',
    name: 'Smart Casual',
    details: 'College · Everyday',
    colors: '#DCE5E4',
    tags: ['Bottoms', 'Tops'],
  },
];

export default function HomeScreen() {
  const [category, setCategory] = useState('All');
  const [tab, setTab] = useState('Home');
  const [saved, setSaved] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(false);

  const visibleOutfits =
    category === 'All'
      ? outfits
      : outfits.filter((item) => item.tags.includes(category));

  
const navigate = (nextTab: string) => {
  if (nextTab === 'Wardrobe') {
    router.push('/wardrobe');
    return;
  }

  if (nextTab === 'AI Stylist') {
    router.push('/stylist');
    return;
  }

  if (nextTab === 'Planner') {
    router.push('/planner');
    return;
  }

  setTab(nextTab);
  setShowTip(nextTab !== 'Home');
};

  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>style<Text style={styles.brandAI}>AI</Text></Text>
            <Text style={styles.tagline}>YOUR WARDROBE. YOUR STYLE.</Text>
          </View>
          <Pressable
            style={styles.avatar}
            onPress={() => navigate('Profile')}
          >
            <Text style={styles.avatarText}>S</Text>
          </Pressable>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.eyebrow}>YOUR PERSONAL AI STYLIST</Text>
          <Text style={styles.heading}>
            Good morning, {'\n'}
            <Text style={styles.headingAccent}>style icon.</Text>
          </Text>
          <Text style={styles.description}>
            Great style starts with what you already own.
          </Text>
        </View>

        <Pressable
          style={styles.aiCard}
          onPress={() => navigate('AI Stylist')}
        >
          <View style={styles.aiTop}>
            <View style={styles.aiIcon}>
              <Text style={{ fontSize: 23 }}>✦</Text>
            </View>
            <Text style={styles.aiLabel}>STYLEAI ASSISTANT</Text>
          </View>
          <Text style={styles.aiHeading}>What shall we wear today?</Text>
          <Text style={styles.aiDescription}>
            Discover outfits made for you, your mood and your day.
          </Text>
          <View style={styles.aiButton}>
            <Text style={styles.aiButtonText}>Find my outfit</Text>
            <Text style={styles.aiButtonText}>↗</Text>
          </View>
          <Text style={styles.sparkle}>✧</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your wardrobe</Text>
            <Text style={styles.sectionSubtitle}>
              Your pieces, endless possibilities.
            </Text>
          </View>
          <Pressable onPress={() => navigate('Wardrobe')}>
            <Text style={styles.link}>View all ↗</Text>
          </Pressable>
        </View>

        <View style={styles.wardrobeGrid}>
          <Pressable
            style={[styles.wardrobeTile, { backgroundColor: '#EDE0D3' }]}
            onPress={() => navigate('Wardrobe')}
          >
            <Text style={styles.tileEmoji}>👚</Text>
            <Text style={styles.tileTitle}>My clothes</Text>
            <Text style={styles.tileCaption}>Build your digital closet</Text>
          </Pressable>
          <Pressable
            style={[styles.wardrobeTile, { backgroundColor: '#E1E7E1' }]}
            onPress={() => navigate('Planner')}
          >
            <Text style={styles.tileEmoji}>🗓️</Text>
            <Text style={styles.tileTitle}>Outfit planner</Text>
            <Text style={styles.tileCaption}>Plan looks ahead</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Outfit inspiration</Text>
            <Text style={styles.sectionSubtitle}>
              A little inspiration goes a long way.
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.category,
                category === item && styles.categoryActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {visibleOutfits.map((outfit) => (
          <View key={outfit.name} style={styles.outfitCard}>
            <View
              style={[
                styles.outfitImage,
                { backgroundColor: outfit.colors },
              ]}
            >
              <Text style={styles.outfitEmoji}>{outfit.emoji}</Text>
              <Pressable
                style={styles.saveButton}
                onPress={() =>
                  setSaved((previous) =>
                    previous.includes(outfit.name)
                      ? previous.filter((name) => name !== outfit.name)
                      : [...previous, outfit.name]
                  )
                }
              >
                <Text style={styles.saveText}>
                  {saved.includes(outfit.name) ? '♥' : '♡'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.outfitInfo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.outfitName}>{outfit.name}</Text>
                <Text style={styles.outfitDetails}>{outfit.details}</Text>
              </View>
              <Pressable
                onPress={() => navigate('AI Stylist')}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>↗</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={styles.plannerCard}>
          <Text style={styles.plannerEmoji}>☀️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.plannerTitle}>Your week, styled.</Text>
            <Text style={styles.plannerText}>
              Plan your looks and make mornings easier.
            </Text>
          </View>
          <Pressable onPress={() => navigate('Planner')}>
            <Text style={styles.link}>Plan →</Text>
          </Pressable>
        </View>

        {showTip && (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>{tab}</Text>
            <Text style={styles.noticeText}>
              Your {tab.toLowerCase()} workspace is coming next. This is the
              first dashboard prototype.
            </Text>
            <Pressable onPress={() => navigate('Home')}>
              <Text style={styles.link}>Back to Home</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.footer}>DRESS LIKE YOU. EVERY SINGLE DAY.</Text>
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          { name: 'Home', icon: '⌂' },
          { name: 'Wardrobe', icon: '♧' },
          { name: 'AI Stylist', icon: '✦' },
          { name: 'Planner', icon: '▦' },
          { name: 'Profile', icon: '○' },
        ].map((item) => (
          <Pressable
            key={item.name}
            style={styles.navItem}
            onPress={() =>
              navigate(item.name === 'Planner' ? 'Outfit Planner' : item.name)
            }
          >
            <Text
              style={[
                styles.navIcon,
                tab === item.name ||
                (item.name === 'Planner' && tab === 'Outfit Planner')
                  ? styles.navActive
                  : null,
              ]}
            >
              {item.icon}
            </Text>
            <Text
              style={[
                styles.navLabel,
                (tab === item.name ||
                (item.name === 'Planner' && tab === 'Outfit Planner')) &&
                  styles.navLabelActive,
              ]}
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 30,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  brand: {
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -1.5,
    color: COLORS.dark,
  },
  brandAI: { color: COLORS.accent },
  tagline: {
    fontSize: 9,
    letterSpacing: 2,
    color: COLORS.muted,
    marginTop: 3,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, color: COLORS.accent, fontWeight: '700' },
  welcome: { marginBottom: 24 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.accent,
    marginBottom: 12,
  },
  heading: {
    fontSize: 37,
    lineHeight: 43,
    letterSpacing: -1.3,
    fontWeight: '700',
    color: COLORS.dark,
  },
  headingAccent: { color: COLORS.accent, fontStyle: 'italic' },
  description: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 20,
  },
  aiCard: {
    backgroundColor: '#342B28',
    borderRadius: 23,
    padding: 22,
    marginBottom: 30,
    overflow: 'hidden',
  },
  aiTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiIcon: {
    height: 37,
    width: 37,
    borderRadius: 13,
    backgroundColor: '#51403A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    fontSize: 10,
    color: '#E8C9B7',
    letterSpacing: 1.8,
    fontWeight: '700',
  },
  aiHeading: {
    fontSize: 23,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 22,
    maxWidth: 280,
  },
  aiDescription: {
    fontSize: 12,
    color: '#D0C4BD',
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 280,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 22,
    backgroundColor: '#F5E8DC',
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  aiButtonText: { fontSize: 12, color: '#342B28', fontWeight: '700' },
  sparkle: {
    position: 'absolute',
    right: 23,
    top: 76,
    fontSize: 92,
    color: '#66514A',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: -0.5,
  },
  sectionSubtitle: { fontSize: 11, color: COLORS.muted, marginTop: 5 },
  link: { fontSize: 11, color: COLORS.accent, fontWeight: '700' },
  wardrobeGrid: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  wardrobeTile: {
    flex: 1,
    minHeight: 145,
    borderRadius: 18,
    padding: 15,
    justifyContent: 'flex-end',
  },
  tileEmoji: { fontSize: 34, marginBottom: 14 },
  tileTitle: { fontSize: 14, color: COLORS.dark, fontWeight: '700' },
  tileCaption: { fontSize: 10, color: '#766A61', marginTop: 5 },
  categories: { gap: 8, paddingBottom: 16 },
  category: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  categoryActive: {
    backgroundColor: COLORS.dark,
    borderColor: COLORS.dark,
  },
  categoryText: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
  outfitCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 10,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outfitImage: {
    height: 155,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outfitEmoji: { fontSize: 76 },
  saveButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: COLORS.accent, fontSize: 21 },
  outfitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 12,
  },
  outfitName: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  outfitDetails: { fontSize: 11, color: COLORS.muted, marginTop: 5 },
  arrowButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontSize: 18, color: COLORS.accent },
  plannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.light,
    borderRadius: 17,
    padding: 16,
    marginTop: 8,
  },
  plannerEmoji: { fontSize: 27 },
  plannerTitle: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  plannerText: {
    fontSize: 10,
    color: COLORS.muted,
    lineHeight: 16,
    marginTop: 4,
    maxWidth: 180,
  },
  notice: {
    marginTop: 20,
    padding: 18,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  noticeTitle: { fontSize: 18, color: COLORS.dark, fontWeight: '700' },
  noticeText: { fontSize: 12, color: COLORS.muted, lineHeight: 19 },
  footer: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 30,
    marginBottom: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 11,
    paddingBottom: 10,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', gap: 4, flex: 1 },
  navIcon: { fontSize: 22, color: '#A59A92' },
  navActive: { color: COLORS.accent },
  navLabel: { fontSize: 9, color: '#A59A92' },
  navLabelActive: { color: COLORS.accent, fontWeight: '700' },
});
