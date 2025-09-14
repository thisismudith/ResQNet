import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function GuidelinesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All Disasters');
  const [disaster, setDisaster] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'during' | 'before' | 'after' | 'supplies' | 'warnings'>('during');

  // Categories
  const categories = ['All Disasters', 'Geological', 'Weather', 'Fire', 'Water', 'Other'];
  const color = ['#9E9E9E', '#8D6E63', '#42A5F5', '#EF5350', '#26A69A', '#AB47BC'];

  // All disasters
  const disasters = [
    {
      name: 'Flood',
      emoji: '🌊',
      description: 'Overflow of water onto normally dry land, often caused by heavy rainfall, storm surge, or dam failure.',
      category: 'Water',
      color: '#26A69A',
    },
    {
      name: 'Earthquake',
      emoji: '🌍',
      description: "Shaking of the ground caused by sudden movement of tectonic plates beneath the Earth's surface.",
      category: 'Geological',
      color: '#8D6E63',
    },
    {
      name: 'Blizzard',
      emoji: '❄️',
      description: 'Severe snowstorm with strong winds and low visibility lasting for hours or even days.',
      category: 'Weather',
      color: '#42A5F5',
    },
    {
      name: 'Tornado',
      emoji: '🌪️',
      description: 'A rapidly rotating column of air extending from a thunderstorm to the ground, capable of massive destruction.',
      category: 'Weather',
      color: '#42A5F5',
    },
    {
      name: 'Wildfire',
      emoji: '🔥',
      description: 'Uncontrolled fire spreading rapidly through vegetation, often fueled by dry conditions and wind.',
      category: 'Fire',
      color: '#EF5350',
    },
    {
      name: 'Hurricane',
      emoji: '🌀',
      description: 'A powerful tropical cyclone with strong winds and heavy rain, forming over warm ocean waters.',
      category: 'Weather',
      color: '#42A5F5',
    },
    {
      name: 'Landslide',
      emoji: '⛰️',
      description: 'The movement of rock, earth, or debris down a slope due to gravity, often triggered by rain or earthquakes.',
      category: 'Geological',
      color: '#8D6E63',
    },
    {
      name: 'Drought',
      emoji: '☀️',
      description: 'A prolonged period of abnormally low rainfall leading to water shortages and crop failures.',
      category: 'Other',
      color: '#AB47BC',
    },
    {
      name: 'Tsunami',
      emoji: '🌊',
      description: 'A series of ocean waves with extremely long wavelengths caused by underwater earthquakes or volcanic eruptions.',
      category: 'Water',
      color: '#26A69A',
    },
  ];

  // -------- DETAIL VIEW --------
  if (disaster) {
    const color = '#e63946';
    const tagColor = '#42A5F5';
    const emoji = disaster.emoji || '⚠️';
    const description = `Guidance and safety information for ${disaster.name.toLowerCase()}. Follow the steps below for preparation, emergency actions, and recovery.`;

    const TabButton = ({ value, label }: { value: typeof activeTab; label: string }) => (
      <TouchableOpacity
        onPress={() => setActiveTab(value)}
        style={{
          flex: 1,
          paddingVertical: 10,
          alignItems: 'center',
          backgroundColor: activeTab === value ? color : '#ffffff',
          borderRightWidth: 1,
          borderColor: '#E5E7EB',
        }}
      >
        <Text style={{ color: activeTab === value ? '#ffffff' : '#111827', fontWeight: '700' }}>
          {label}
        </Text>
      </TouchableOpacity>
    );

    const SectionCard = ({
      headerColor,
      title,
      bullets,
    }: {
      headerColor: string;
      title: string;
      bullets: string[];
    }) => (
      <View
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          elevation: 2,
          marginBottom: 16,
        }}
      >
        <View style={{ backgroundColor: headerColor, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 18 }}>{title}</Text>
        </View>
        <View style={{ padding: 16 }}>
          {bullets.map((b, i) => (
            <Text key={i} style={{ fontSize: 16, color: '#111827', marginBottom: 10 }}>
              • {b}
            </Text>
          ))}
        </View>
      </View>
    );

    const during = [
      `Follow official alerts related to ${disaster.name.toLowerCase()}.`,
      'Move to a safe location and avoid hazards.',
      'Assist vulnerable individuals when safe.',
    ];
    const preparation = [
      `Prepare an emergency plan specific to ${disaster.name.toLowerCase()}.`,
      'Stock a 3–7 day supply kit and copies of documents.',
      'Identify evacuation routes and meeting points.',
    ];
    const after = [
      'Wait for the official all-clear.',
      'Watch for hazards and document damage.',
      'Contact insurers and local authorities as needed.',
    ];
    const supplies = [
      'Water, non-perishable food, medications',
      'First-aid kit, flashlight, batteries, radio',
      'Power bank, hygiene supplies, copies of IDs',
    ];
    const warnings = [
      `Official ${disaster.name.toLowerCase()} watch/warning issued`,
      'Rapidly changing local conditions',
      'Evacuation notices or road closures',
    ];

    return (
      <ScrollView style={{ padding: 16, backgroundColor: '#fff' }}>
        {/* Back */}
        <TouchableOpacity onPress={() => setDisaster(null)} style={{ marginBottom: 12 }}>
          <Text style={{ color, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View
          style={{
            backgroundColor: '#f9f9f9',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#e0e0e0', borderRadius: 8, padding: 8 }}>
              <Text style={{ fontSize: 28 }}>{emoji}</Text>
            </View>
            <View style={{ backgroundColor: tagColor, width: 24, height: 24, borderRadius: 12 }} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', marginTop: 10 }}>{disaster.name}</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 6 }}>{description}</Text>
        </View>

        {/* Emergency alert */}
        <View
          style={{
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            borderWidth: 1,
            borderRadius: 12,
            marginBottom: 16,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#7F1D1D', marginBottom: 6 }}>
            Emergency Alert
          </Text>
          <Text style={{ color: '#B91C1C' }}>
            If currently experiencing a {disaster.name.toLowerCase()}, call emergency services at
            911. Follow the "During Emergency" steps below.
          </Text>
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            marginBottom: 16,
          }}
        >
          <TabButton value="during" label="During Emergency" />
          <TabButton value="before" label="Preparation" />
          <TabButton value="after" label="After Disaster" />
          <TabButton value="supplies" label="Supplies" />
          <TabButton value="warnings" label="Warning Signs" />
        </View>

        {/* Content */}
        {activeTab === 'during' && (
          <SectionCard headerColor={color} title={`What to Do During a ${disaster.name}`} bullets={during} />
        )}
        {activeTab === 'before' && (
          <SectionCard headerColor="#3B82F6" title="Preparation Steps" bullets={preparation} />
        )}
        {activeTab === 'after' && (
          <SectionCard headerColor="#22C55E" title={`After the ${disaster.name}`} bullets={after} />
        )}
        {activeTab === 'supplies' && (
          <SectionCard headerColor="#A855F7" title="Emergency Supplies Checklist" bullets={supplies} />
        )}
        {activeTab === 'warnings' && (
          <SectionCard headerColor="#F59E0B" title="Warning Signs to Watch For" bullets={warnings} />
        )}
      </ScrollView>
    );
  }

  // -------- LIST VIEW --------
  const filteredDisasters =
    selectedCategory === 'All Disasters'
      ? disasters
      : disasters.filter(d => d.category === selectedCategory);

  return (
    <ScrollView style={{ padding: 16, backgroundColor: '#fff' }}>
      {/* Browse by Category */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Browse by Category</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: color[categories.indexOf(cat)],
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: selectedCategory === cat ? '#fff' : '#000',
                  fontWeight: '600',
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* All Disasters Section */}
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>All Disasters</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          {filteredDisasters.length} disasters
        </Text>

        {filteredDisasters.map((disaster, index) => (
          <View
            key={index}
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#e0e0e0', borderRadius: 8, padding: 8 }}>
                <Text style={{ fontSize: 24 }}>{disaster.emoji}</Text>
              </View>
              <View
                style={{
                  backgroundColor: disaster.color,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                }}
              />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '600', marginVertical: 8 }}>{disaster.name}</Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>{disaster.description}</Text>
            <TouchableOpacity
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#e63946',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
              }}
              onPress={() => setDisaster(disaster)}
            >
              <Text style={{ color: '#e63946', fontWeight: '600' }}>View Details →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
