import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
<<<<<<< Updated upstream
import Core from '../core.ts';
=======
import Core from '../core';
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
import Ionicons from 'react-native-vector-icons/Ionicons';

const COLORS = {
  bg: '#FFEDE8',
  ringLight: '#FFD3CB',
  ringMid: '#FFA99A',
  ringCore: '#EF4444',
  text: '#2b3342',
  sub: '#6b7280',
  chip: '#fff',
  chipBorder: '#f0b4aa',
  chipText: '#c2410c',
  chipAltBorder: '#e5e7eb',
  selectedBg: '#ffe6e1',
  selectedBorder: '#fb9a89',
};

type ChipDef = {
  key: string;
  label: string;
  emoji?: string;
  group: 'main' | 'alt';
};

const MAIN_EMERGENCIES: ChipDef[] = [
  { key: 'fire', label: 'Fire', emoji: '🔥', group: 'main' },
  { key: 'earthquake', label: 'Earthquake', emoji: '🏚️', group: 'main' },
  { key: 'flood', label: 'Flood', emoji: '🌊', group: 'main' },
  { key: 'landslide', label: 'Landslide', emoji: '⚠️', group: 'main' },
  { key: 'cyclone', label: 'Cyclone', emoji: '🌀', group: 'main' },
  { key: 'other', label: 'Other', group: 'main' },
];

const OTHER_CHIPS: ChipDef[] = [
  { key: 'accident', label: 'I have an accident', group: 'alt' },
  { key: 'injury', label: 'I have an injury', group: 'alt' },
  { key: 'faint', label: 'Feeling unconscious', group: 'alt' },
];

const HOLD_MS = 3000;
const CoreAPI = new Core();

export default function SOS() {
    const navigation = useNavigation<any>();
    const [geoX, setGeoX] = useState<number | null>(null);
    const [geoY, setGeoY] = useState<number | null>(null);
    const [geoTimestamp, setGeoTimestamp] = useState<number | null>(null);
    const [location, setLocation] = useState<string | null>(null);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const [locationLine, setLocationLine] = useState('Fetching location...');

    // Arm / cancel logic
    const [isArmed, setIsArmed] = useState(false);
    const [isArming, setIsArming] = useState(false);
    const [remainingMs, setRemainingMs] = useState(HOLD_MS);
    const armTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tickRef = useRef<NodeJS.Timeout | null>(null);
 

  // chip selection
  const [selected, setSelected] = useState<ChipDef | null>(null);
  const selectChip = (c: ChipDef) => {
    if (!isArmed && !isArming) setSelected(c);
  };
=======

    // chip selection
    const [selected, setSelected] = useState<ChipDef | null>(null);
    const selectChip = (c: ChipDef) => setSelected(c);

    // Arm / cancel logic
    const [isArmed, setIsArmed] = useState(false);
    const [isArming, setIsArming] = useState(false);
    const [remainingMs, setRemainingMs] = useState(HOLD_MS);
    const armTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tickRef = useRef<NodeJS.Timeout | null>(null);
>>>>>>> Stashed changes

    const activateSOS = () => {
        const key = selected?.key ?? 'unspecified';
        // Alert.alert('SOS sent', `SOS initiated for: ${key}`);
        // reset state after send
        setIsArming(false);
        setRemainingMs(HOLD_MS);
        setIsArmed(true);
    };

    const deactivateSOS = () => {
        // Alert.alert('SOS cancelled', `SOS cancelled`);
        setIsArmed(false);
    };

    useEffect(() => {
        if (isArmed) CoreAPI.start();
        else CoreAPI.stop();

        // return () => CoreAPI.cleanup();
    }, [isArmed]);
<<<<<<< Updated upstream
    
  
=======
>>>>>>> Stashed changes
=======

    // chip selection
    const [selected, setSelected] = useState<ChipDef | null>(null);
    const selectChip = (c: ChipDef) => setSelected(c);

    // Arm / cancel logic
    const [isArmed, setIsArmed] = useState(false);
    const [isArming, setIsArming] = useState(false);
    const [remainingMs, setRemainingMs] = useState(HOLD_MS);
    const armTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tickRef = useRef<NodeJS.Timeout | null>(null);

    const activateSOS = () => {
        const key = selected?.key ?? 'unspecified';
        // Alert.alert('SOS sent', `SOS initiated for: ${key}`);
        // reset state after send
        setIsArming(false);
        setRemainingMs(HOLD_MS);
        setIsArmed(true);
    };

    const deactivateSOS = () => {
        // Alert.alert('SOS cancelled', `SOS cancelled`);
        setIsArmed(false);
    };

    useEffect(() => {
        if (isArmed) CoreAPI.start();
        else CoreAPI.stop();

        // return () => CoreAPI.cleanup();
    }, [isArmed]);
>>>>>>> Stashed changes
    const refreshFromCore = async () => {
        await CoreAPI.fetchLocation();
        setGeoX(typeof CoreAPI.geoX === 'number' ? CoreAPI.geoX : null);
        setGeoY(typeof CoreAPI.geoY === 'number' ? CoreAPI.geoY : null);
        setGeoTimestamp(typeof CoreAPI.timestamp === 'number' ? CoreAPI.timestamp : null);
        setLocation(typeof CoreAPI.location === 'string' ? CoreAPI.location : null);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        
        setLocationLine(geoY != null && geoX != null
          ? `${geoY.toFixed(5)}, ${geoX.toFixed(5)}`
          : 'Fetching location...');
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    };
    refreshFromCore();
    const cancelArming = () => {
        setIsArming(false);
        setRemainingMs(HOLD_MS);
        if (armTimeoutRef.current) {
        clearTimeout(armTimeoutRef.current);
        armTimeoutRef.current = null;
        }
        if (tickRef.current) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        clearInterval(tickRef.current);
        tickRef.current = null;
        }
    };

  const startArming = () => {
    setIsArming(true);
    setRemainingMs(HOLD_MS);
    const start = Date.now();

    armTimeoutRef.current = setTimeout(() => {
      armTimeoutRef.current = null;
      if (tickRef.current) {
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        clearInterval(tickRef.current);
        tickRef.current = null;
        }
    };

    const startArming = () => {
        setIsArming(true);
        setRemainingMs(HOLD_MS);
        const start = Date.now();

        armTimeoutRef.current = setTimeout(() => {
        armTimeoutRef.current = null;
        if (tickRef.current) {
            clearInterval(tickRef.current);
            tickRef.current = null;
        }
        activateSOS();
        }, HOLD_MS);

        tickRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const left = Math.max(0, HOLD_MS - elapsed);
        setRemainingMs(left);
        }, 100);
    };

    // toggle on tap
    const onPressSOS = () => {
        if (isArmed) {
        deactivateSOS();
        } else if (isArming) {
        // second press within 3s -> cancel
        cancelArming();
        } else {
        startArming();
        }
    };

    // cleanup timers on unmount / nav away
    useEffect(() => () => cancelArming(), []);

<<<<<<< Updated upstream
<<<<<<< Updated upstream

    return (
        <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.h1}>Having an emergency?</Text>
            <Text style={styles.sub}> Tap SOS to arm. It will send in 3 seconds. Tap again to cancel before it sends.</Text>


        {/* Location card (wired to CORE) */}
        <View style={styles.locCard}>
          <Ionicons name="location-sharp" size={20} color={COLORS.ringCore} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locTitle}>Your Location</Text>
            <Text style={styles.locText} numberOfLines={1}>
              {CoreAPI.geoX}, {CoreAPI.geoY}
            </Text>
          </View>
          <Pressable
            onPress={CoreAPI.fetchLocation}
            style={({ pressed }) => [
              styles.smallBtn,
              pressed ? styles.smallBtnPressed : styles.smallBtn,
            ]}
          >
            <Text style={styles.smallBtnText}>Refresh</Text>
          </Pressable>
        </View>
=======
    // pulse animation while arming
    const pulse = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (isArming || isArmed) {
        const loop = Animated.loop(
            Animated.sequence([
            Animated.timing(pulse, {
                toValue: 1,
                duration: isArmed ? 250 : 500,
                useNativeDriver: true,
            }),
            Animated.timing(pulse, {
                toValue: 0,
                duration: isArmed ? 250 : 500,
                useNativeDriver: true,
            }),
            ]),
        );
        loop.start();
        return () => loop.stop();
        } else {
        pulse.stopAnimation();
        pulse.setValue(0);
        }
    }, [isArming, isArmed, pulse]);
    const scalePulse = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05],
    });
>>>>>>> Stashed changes

    const secondsLeft = Math.ceil(remainingMs / 1000);

    const locationLine =
    geoY != null && geoX != null
      ? `${geoY.toFixed(5)}, ${geoX.toFixed(5)}`
      : 'Fetching location...';

=======
    // pulse animation while arming
    const pulse = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (isArming || isArmed) {
        const loop = Animated.loop(
            Animated.sequence([
            Animated.timing(pulse, {
                toValue: 1,
                duration: isArmed ? 250 : 500,
                useNativeDriver: true,
            }),
            Animated.timing(pulse, {
                toValue: 0,
                duration: isArmed ? 250 : 500,
                useNativeDriver: true,
            }),
            ]),
        );
        loop.start();
        return () => loop.stop();
        } else {
        pulse.stopAnimation();
        pulse.setValue(0);
        }
    }, [isArming, isArmed, pulse]);
    const scalePulse = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05],
    });

    const secondsLeft = Math.ceil(remainingMs / 1000);

    const locationLine =
    geoY != null && geoX != null
      ? `${geoY.toFixed(5)}, ${geoX.toFixed(5)}`
      : 'Fetching location...';

>>>>>>> Stashed changes
    return (
        <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.h1}>Having an emergency?</Text>
            <Text style={styles.sub}> Tap SOS to arm. It will send in 3 seconds. Tap again to cancel before it sends.</Text>


            {/* Location card (wired to CORE) */}
            <View style={styles.locCard}>
                <Ionicons name="location-sharp" size={20} color={COLORS.ringCore} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.locTitle}>Your Location</Text>
                    <Text style={styles.locText} numberOfLines={1}>{locationLine}</Text>
                </View>
                <Pressable onPress={refreshFromCore} style={({ pressed }) => [ styles.smallBtn, pressed ? styles.smallBtnPressed : styles.smallBtn, ]}>
                    <Text style={styles.smallBtnText}>Refresh</Text>
                </Pressable>
            </View>

            {/* Big SOS button */}
            <View style={styles.sosWrap}>
            <Animated.View
                style={[
                styles.ringOuter,
                { transform: [{ scale: isArming || isArmed ? scalePulse : 1 }] },
                ]}
            />
            <Animated.View
                style={[
                styles.ringMid,
                { transform: [{ scale: isArming || isArmed ? scalePulse : 1 }] },
                ]}
            />
            <Pressable
                onPress={onPressSOS}
                style={styles.sosCore}
                android_disableSound
            >
                <Text style={styles.sosText}>{isArmed ? 'ARMED!!' : 'SOS'}</Text>
                <Text style={styles.sosHint}>
                {isArming
                    ? `Sending in ${secondsLeft}s • Tap to Cancel`
                    : isArmed
                    ? 'Keep tight! Help is on the way'
                    : 'Tap to Send'}
                </Text>
                {selected && (
                <Text style={styles.selectedHint}>for: {selected.label}</Text>
                )}
            </Pressable>
            </View>

            {/* Main emergencies */}
            <Text style={styles.groupTitle}>What’s your emergency?</Text>
            <View style={styles.chips}>
            {MAIN_EMERGENCIES.map(c => (
                <Chip
                key={c.key}
                data={c}
                selected={selected?.key === c.key}
                onSelect={selectChip}
                />
            ))}
            </View>

            {/* Side emergencies */}
            <Text style={[styles.groupTitle, { marginTop: 14 }]}>
            Something else?
            </Text>
            <View style={styles.chips}>
            {OTHER_CHIPS.map(c => (
                <Chip
                key={c.key}
                data={c}
                selected={selected?.key === c.key}
                onSelect={selectChip}
                />
            ))}
            </View>

            {/* Go back -> Home */}
            <Pressable
            onPress={() =>
                navigation.reset({
                index: 0,
                routes: [{ name: 'TopTabs', params: { screen: 'Home' } }],
                })
            }
            style={styles.backLink}
            >
            <Text style={styles.backText}>← Go back</Text>
            </Pressable>

            <View style={{ height: 16 }} />
        </ScrollView>
        </SafeAreaView>
    );
}

function Chip({
  data,
  selected,
  onSelect,
}: {
  data: ChipDef;
  selected: boolean;
  onSelect: (c: ChipDef) => void;
}) {
  const isMain = data.group === 'main';
  return (
    <Pressable
      onPress={() => onSelect(data)}
      style={[
        styles.chip,
        {
          borderColor: selected
            ? COLORS.selectedBorder
            : isMain
            ? COLORS.chipBorder
            : COLORS.chipAltBorder,
          backgroundColor: selected ? COLORS.selectedBg : COLORS.chip,
        },
      ]}
    >
      {data.emoji ? <Text style={{ marginRight: 6 }}>{data.emoji}</Text> : null}
      <Text
        style={[
          styles.chipText,
          {
            color: isMain ? COLORS.chipText : COLORS.sub,
            fontWeight: selected ? '900' : '700',
          },
        ]}
      >
        {data.label}
      </Text>
    </Pressable>
  );
}

const SIZE = 220;
const RING1 = SIZE + 70;
const RING2 = SIZE + 30;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },

  h1: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 8,
    marginHorizontal: 'auto',
  },
  sub: {
    color: COLORS.sub,
    marginTop: 6,
    lineHeight: 20,
    marginHorizontal: 'auto',
    textAlign: 'center',
  },

  locCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locTitle: { fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  locText: { color: COLORS.sub, maxWidth: '70%' },

  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  smallBtnPressed: {
    backgroundColor: '#f3f4f6',
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  },
=======
    },
>>>>>>> Stashed changes
=======
    },
>>>>>>> Stashed changes
  smallBtnText: { fontWeight: '800', color: COLORS.text },

  sosWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    height: RING1,
  },
  ringOuter: {
    position: 'absolute',
    width: RING1,
    height: RING1,
    borderRadius: RING1 / 2,
    backgroundColor: COLORS.ringLight,
    opacity: 0.8,
  },
  ringMid: {
    position: 'absolute',
    width: RING2,
    height: RING2,
    borderRadius: RING2 / 2,
    backgroundColor: COLORS.ringMid,
    opacity: 0.85,
  },
  sosCore: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: COLORS.ringCore,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  sosText: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: 1 },
  sosHint: {
    color: '#ffe4e0',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  selectedHint: {
    color: '#fff',
    marginTop: 2,
    fontWeight: '700',
    opacity: 0.9,
  },

  groupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontWeight: '700' },

  backLink: { alignSelf: 'center', marginTop: 18, padding: 8 },
  backText: { color: COLORS.text, fontWeight: '800' },
});
