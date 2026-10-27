
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type OutfitPlan = {
  id: string;
  date: string;
  occasion: string;
  outfit: string;
  notes: string;
};

const STORAGE_KEY = 'styleai-outfit-plans';
const OCCASIONS = ['College', 'Office', 'Party', 'Casual', 'Other'];

function todayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function PlannerScreen() {
  const router = useRouter();

  const [plans, setPlans] = useState<OutfitPlan[]>([]);
  const [date, setDate] = useState(todayString());
  const [occasion, setOccasion] = useState('College');
  const [outfit, setOutfit] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setPlans(parsed);
        }
      } catch (error) {
        console.error('Could not load outfit plans:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  async function savePlans(updated: OutfitPlan[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setPlans(updated);
      return true;
    } catch (error) {
      console.error('Could not save outfit plans:', error);
      Alert.alert('Error', 'Plan save nahi ho paya. Dobara try karo.');
      return false;
    }
  }

  async function addPlan() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Invalid date', 'Date YYYY-MM-DD format mein likho.');
      return;
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      Alert.alert('Invalid date', 'Please enter a valid calendar date.');
      return;
    }

    if (!outfit.trim()) {
      Alert.alert('Outfit required', 'Apne outfit ka naam likho.');
      return;
    }

    const plan: OutfitPlan = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date,
      occasion,
      outfit: outfit.trim(),
      notes: notes.trim(),
    };

    const updated = [...plans, plan].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const success = await savePlans(updated);

    if (success) {
      setOutfit('');
      setNotes('');
      Alert.alert('Saved! ✨', 'Your outfit plan has been saved.');
    }
  }

  async function deletePlan(id: string) {
    const updated = plans.filter((plan) => plan.id !== id);
    await savePlans(updated);
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable onPress={() => router.replace('/')} style={styles.back}>
        <Text style={styles.backText}>← Home</Text>
      </Pressable>

      <Text style={styles.brand}>STYLEAI ✨</Text>
      <Text style={styles.title}>Outfit Planner</Text>
      <Text style={styles.subtitle}>
        Plan your looks. Make every day stylish.
      </Text>

      <View style={styles.summary}>
        <Text style={styles.summaryNumber}>{plans.length}</Text>
        <Text style={styles.summaryLabel}>Outfit plans saved</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Plan a new outfit</Text>

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="2026-10-17"
          placeholderTextColor="#A99587"
          style={styles.input}
          autoCapitalize="none"
        />

        <Pressable
          style={styles.todayButton}
          onPress={() => setDate(todayString())}
        >
          <Text style={styles.todayText}>Use today's date</Text>
        </Pressable>

        <Text style={styles.label}>Occasion</Text>
        <View style={styles.choices}>
          {OCCASIONS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setOccasion(item)}
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

        <Text style={styles.label}>What will you wear?</Text>
        <TextInput
          value={outfit}
          onChangeText={setOutfit}
          placeholder="e.g. White shirt + blue jeans"
          placeholderTextColor="#A99587"
          style={styles.input}
          maxLength={150}
        />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add accessories, shoes or other details..."
          placeholderTextColor="#A99587"
          style={[styles.input, styles.notesInput]}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />

        <Pressable
          style={styles.button}
          onPress={addPlan}
          disabled={loading}
        >
          <Text style={styles.buttonText}>＋ Save Outfit Plan</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Your Upcoming Looks</Text>

      {!loading && plans.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>👗</Text>
          <Text style={styles.emptyTitle}>Your calendar is waiting!</Text>
          <Text style={styles.body}>
            Add your first outfit plan above. It will appear here.
          </Text>
        </View>
      )}

      {plans.map((plan) => (
        <View key={plan.id} style={styles.planCard}>
          <View style={styles.planTop}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{plan.date}</Text>
            </View>

            <Pressable
              onPress={() =>
                Alert.alert(
                  'Delete this plan?',
                  'This outfit plan will be removed.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        void deletePlan(plan.id);
                      },
                    },
                  ]
                )
              }
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>

          <Text style={styles.planOccasion}>{plan.occasion}</Text>
          <Text style={styles.planOutfit}>{plan.outfit}</Text>

          {plan.notes ? (
            <Text style={styles.planNotes}>📝 {plan.notes}</Text>
          ) : null}
        </View>
      ))}

      <Pressable
        onPress={() => router.push('/stylist')}
        style={styles.secondary}
      >
        <Text style={styles.secondaryText}>
          ✨ Get outfit ideas from AI Stylist
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        StyleAI • Your personal style companion
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAF4EC' },
  content: { padding: 24, paddingTop: 32, paddingBottom: 40 },
  back: { marginBottom: 24 },
  backText: { color: '#70452F', fontSize: 16, fontWeight: '600' },
  brand: { color: '#9B6A4A', fontSize: 13, letterSpacing: 3, fontWeight: '700' },
  title: { fontSize: 32, fontWeight: '800', color: '#38251D', marginTop: 12 },
  subtitle: { color: '#846D60', fontSize: 15, marginTop: 8, marginBottom: 24 },
  summary: { backgroundColor: '#EFE3D6', padding: 18, borderRadius: 18, marginBottom: 22 },
  summaryNumber: { color: '#70452F', fontSize: 28, fontWeight: '800' },
  summaryLabel: { color: '#846D60', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, marginBottom: 26 },
  cardTitle: { color: '#38251D', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  label: { color: '#38251D', fontWeight: '700', marginTop: 12, marginBottom: 9 },
  input: { backgroundColor: '#FAF4EC', borderWidth: 1, borderColor: '#E6D6C8', borderRadius: 12, padding: 14, color: '#38251D', fontSize: 15 },
  notesInput: { minHeight: 95 },
  todayButton: { alignSelf: 'flex-start', paddingVertical: 10 },
  todayText: { color: '#9B6A4A', fontWeight: '700' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 13, borderRadius: 22, backgroundColor: '#EFE3D6' },
  selected: { backgroundColor: '#70452F' },
  chipText: { color: '#70452F', fontWeight: '600' },
  selectedText: { color: '#FFFFFF' },
  button: { backgroundColor: '#70452F', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 22 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 21, color: '#38251D', fontWeight: '800', marginBottom: 14 },
  planCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginBottom: 14 },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBadge: { backgroundColor: '#EFE3D6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  dateText: { color: '#70452F', fontWeight: '700' },
  deleteButton: { padding: 8 },
  deleteText: { color: '#A54C3D', fontWeight: '600' },
  planOccasion: { color: '#9B6A4A', fontWeight: '700', marginTop: 14 },
  planOutfit: { color: '#38251D', fontSize: 18, fontWeight: '700', marginTop: 6 },
  planNotes: { color: '#846D60', lineHeight: 22, marginTop: 10 },
  emptyCard: { backgroundColor: '#F0E5D9', borderRadius: 20, padding: 24, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 18, color: '#38251D', fontWeight: '700', marginBottom: 8 },
  body: { color: '#846D60', lineHeight: 23, textAlign: 'center' },
  secondary: { padding: 18, alignItems: 'center', marginTop: 8 },
  secondaryText: { color: '#70452F', fontWeight: '700' },
  footer: { color: '#9B887B', fontSize: 12, textAlign: 'center', marginTop: 20 },
});
