import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert as RNAlert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// 🔥 Modular Firestore
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  startAt,
  endAt,
  limit as qLimit,
} from '@react-native-firebase/firestore';

import { useNavigation } from '@react-navigation/native';

type AlertDoc = {
  title: string;
  issuer: string;
  location: string;
  location_lc?: string; // lowercase location for prefix search
  issuedAt: any;        // Firestore Timestamp
  intensity: 'Low' | 'Moderate' | 'Severe' | 'High';
  type: 'Hurricane' | 'Flood' | 'Earthquake' | 'Landslide' | 'Cyclone' | 'Other';
};
type Item = AlertDoc & { id: string };

export default function AlertsScreen() {
  const navigation = useNavigation<any>();
  const [queryText, setQueryText] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // --- debounce the text so we don't requery on every keystroke
  const [debounced, setDebounced] = useState(queryText);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(queryText), 250);
    return () => clearTimeout(t);
  }, [queryText]);

  // --- live subscription that switches between "latest" and "search"
  const unsubRef = useRef<() => void>();
  useEffect(() => {
    const db = getFirestore();
    // clean previous listener
    unsubRef.current?.();

    const doSearch = debounced.trim().length > 0;
    setLoading(true);

    let qRef;
    if (doSearch) {
      const needle = debounced.trim().toLowerCase();
      // Prefix search on location_lc (requires this field in docs)
      qRef = query(
        collection(db, 'alerts'),
        orderBy('location_lc'),
        startAt(needle),
        endAt(needle + '\uf8ff'),
        qLimit(50)
      );
      // NOTE: If you also want secondary ordering (e.g., by issuedAt desc),
      // add: orderBy('issuedAt', 'desc') AFTER orderBy('location_lc').
      // Firestore may ask you to create a composite index—follow the link it prints.
      //
      // Example:
      // qRef = query(
      //   collection(db, 'alerts'),
      //   orderBy('location_lc'),
      //   orderBy('issuedAt', 'desc'),
      //   startAt(needle),
      //   endAt(needle + '\uf8ff'),
      //   qLimit(50)
      // );
    } else {
      // Default feed: latest alerts by time
      qRef = query(
        collection(db, 'alerts'),
        orderBy('issuedAt', 'desc'),
        qLimit(50)
      );
    }

    const unsub = onSnapshot(
      qRef,
      snap => {
        const next = snap.docs.map(d => ({ id: d.id, ...(d.data() as AlertDoc) }));
        setItems(next);
        setLoading(false);
      },
      err => {
        setLoading(false);
        const msg =
          err.code === 'firestore/permission-denied'
            ? 'You do not have permission to read alerts. Check Firestore rules or App Check.'
            : err.message;
        RNAlert.alert('Firestore error', msg);
      }
    );

    unsubRef.current = unsub;
    return () => unsub();
  }, [debounced]);

  const openGuide = (it: Item) => {
    const parent = navigation.getParent?.();
    (parent ?? navigation).navigate('DisasterGuide' as never, { hazard: it.type } as never);
  };

  const shareAlert = async (it: Item) => {
    try {
      await Share.share({
        message: `${it.title} (${it.intensity} Intensity)\n${it.location}\nIssued by ${it.issuer}`,
      });
    } catch {}
  };

  const renderItem = ({ item }: { item: Item }) => {
    const s = getStylesForIntensity(item.intensity);
    const dt = toNiceDate(item.issuedAt);

    return (
      <View style={[styles.card, s.card]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, s.title]} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.badge, s.chip]}>
            <Text style={[styles.badgeText, s.chipText]}>{item.intensity} Intensity</Text>
          </View>
        </View>

        <Text style={[styles.issuer, s.issuer]} numberOfLines={1}>Issued by {item.issuer}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color={s.iconColor} />
          <Text style={[styles.metaText, s.text]} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={16} color={s.iconColor} />
          <Text style={[styles.metaText, s.text]}>{dt}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Action icon="share-outline" label="Share" color={s.iconColor} onPress={() => shareAlert(item)} />
          <Action icon="mic-outline" label="Listen" color={s.iconColor} onPress={() => RNAlert.alert('Listen','Coming soon')} />
          <Action icon="alert-circle-outline" label={"Dos &\nDon’t"} color={s.iconColor} onPress={() => openGuide(item)} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#9AA2AF" />
        <TextInput
          placeholder="Search location"
          placeholderTextColor="#9AA2AF"
          style={styles.input}
          value={queryText}
          onChangeText={setQueryText}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      <Text style={styles.sectionTitle}>Active Alerts</Text>

      <FlatList
        data={items}
        keyExtractor={it => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 32 }}>
            {loading ? 'Loading…' : 'No alerts'}
          </Text>
        }
      />
    </View>
  );
}

/* ---------- small pieces ---------- */

function Action({
  icon, label, color, onPress,
}: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.actionBtn}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- helpers & styles ---------- */

function toNiceDate(ts: any) {
  try {
    const d: Date = ts?.toDate?.() instanceof Date ? ts.toDate() : ts instanceof Date ? ts : new Date(ts);
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric', timeZoneName: 'short',
    }).format(d);
  } catch { return ''; }
}

function getStylesForIntensity(intensity: Item['intensity']) {
  switch (intensity) {
    case 'High':
      return {
        card: { backgroundColor: '#F1644B' },
        title: { color: '#fff' },
        issuer: { color: '#ffe8e3' },
        chip: { backgroundColor: '#fff' },
        chipText: { color: '#111827' },
        iconColor: '#fff',
        text: { color: '#fff' },
      };
    case 'Severe':
      return {
        card: { backgroundColor: '#FFF3E6' },
        title: { color: '#0f172a' },
        issuer: { color: '#6b7280' },
        chip: { backgroundColor: '#FDBA74' },
        chipText: { color: '#111827' },
        iconColor: '#0f172a',
        text: { color: '#0f172a' },
      };
    case 'Low':
    default:
      return {
        card: { backgroundColor: '#FFFFFF' },
        title: { color: '#0f172a' },
        issuer: { color: '#94a3b8' },
        chip: { backgroundColor: '#FDE68A' },
        chipText: { color: '#111827' },
        iconColor: '#0f172a',
        text: { color: '#0f172a' },
      };
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6', padding: 12, paddingTop: 8 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12,
    height: 42, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB',
  },
  input: { flex: 1, color: '#111827' },
  sectionTitle: { marginTop: 12, marginBottom: 8, fontSize: 16, fontWeight: '800', color: '#111827' },

  card: { borderRadius: 14, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '900' },
  issuer: { marginTop: 2, fontWeight: '700' },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontWeight: '800', fontSize: 12 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  metaText: { fontWeight: '700' },

  actionsRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionText: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
