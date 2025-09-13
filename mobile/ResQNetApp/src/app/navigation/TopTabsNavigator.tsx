import React, { useMemo, useRef } from 'react';
import { StatusBar } from 'react-native';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { TopTabParamList } from './types';
import HomeScreen from '../../screens/Home';
import Apu from '../../screens/Demo';
import DisasterGuideScreen from '../../screens/Guidelines';
import AlertsScreen from '../../screens/Alerts';
import MyNetworkScreen from '../../screens/MyNetwork';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ACTIVE = '#2b3342';
const INACTIVE = '#9ca3af';
const BG = '#ffffff';
const BORDER = '#e5e7eb';
const DRAWER_WIDTH = Math.min(
  300,
  Math.round(Dimensions.get('window').width * 0.8),
);

const Tab = createMaterialTopTabNavigator<TopTabParamList>();

export default function TopTabsNavigator() {
  const tabRef = useRef<any>(null);

  const TabLabel = useMemo(
    () =>
      (icon: string, title: string) =>
      ({ focused }: { focused: boolean }) =>
        (
          <View style={{ alignItems: 'center' }}>
            <Ionicons
              name={focused ? icon : `${icon}-outline`}
              size={18}
              color={focused ? ACTIVE : INACTIVE}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 11,
                color: focused ? ACTIVE : INACTIVE,
                marginTop: 2,
              }}
            >
              {title}
            </Text>
          </View>
        ),
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f3f4f6"
        translucent={false}
      />
      {/* Tabs */}
      <Tab.Navigator
        // @ts-ignore - ref typing is fine for navigation
        ref={tabRef}
        screenOptions={{
          tabBarShowLabel: true,
          tabBarIndicatorStyle: {
            backgroundColor: ACTIVE,
            height: 3,
            borderRadius: 2,
          },
          tabBarStyle: {
            backgroundColor: BG,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomColor: BORDER,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
          tabBarItemStyle: { height: 64 },
        }}
      >
        <Tab.Screen
          name="Home"
          component={Apu}
          options={{ tabBarLabel: TabLabel('home', 'Home') }}
        />
        <Tab.Screen
          name="DisasterGuide"
          component={DisasterGuideScreen}
          options={{ tabBarLabel: TabLabel('checkbox', 'Guidelines') }}
        />
        <Tab.Screen
          name="Alerts"
          component={AlertsScreen}
          options={{ tabBarLabel: TabLabel('alert-circle', 'Alerts') }}
        />
        <Tab.Screen
          name="MyNetwork"
          component={MyNetworkScreen}
          options={{ tabBarLabel: TabLabel('person-circle', 'User') }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

function SideItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.sideItem}>
      <Ionicons name={icon} size={20} color={ACTIVE} />
      <Text style={styles.sideText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconBtn: { padding: 6, marginRight: 8 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: ACTIVE,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: ACTIVE,
  },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#f1f5f9',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sideText: { marginLeft: 10, fontSize: 15, color: ACTIVE },
});
