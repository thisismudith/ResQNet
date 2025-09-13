import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabParamList } from './types';
import HomeScreen from '../../screens/Home';
import DisasterGuideScreen from '../../screens/DisasterGuide';
import AlertsScreen from '../../screens/Alerts';
import VolunteerScreen from '../../screens/MyNetwork';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ACTIVE = '#2b3342';
const INACTIVE = '#9ca3af';
const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: '#fff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: { fontSize: 12, marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          let name: string = 'ellipse';
          switch (route.name) {
            case 'Home':           name = focused ? 'home' : 'home-outline'; break;
            case 'DisasterGuide':  name = focused ? 'checkbox' : 'checkbox-outline'; break;
            case 'Alerts':         name = focused ? 'alert-circle' : 'alert-circle-outline'; break;
            case 'Volunteer':      name = focused ? 'heart' : 'heart-outline'; break;
          }
          return <Ionicons name={name} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="DisasterGuide" component={DisasterGuideScreen} options={{ tabBarLabel: 'Disaster Guide' }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="Volunteer" component={VolunteerScreen} options={{ tabBarLabel: 'Volunteer' }} />
    </Tab.Navigator>
  );
}