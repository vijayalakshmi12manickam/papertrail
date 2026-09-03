import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import BrandHeader from '../components/common/BrandHeader';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ExpensesScreen from '../screens/expenses/ExpensesScreen';
import BudgetScreen from '../screens/budget/BudgetScreen';
import SharedExpensesScreen from '../screens/shared/SharedExpensesScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

// Simple text/emoji icons for now — swap for an icon set (e.g. @expo/vector-icons)
// once the visual pass happens; kept dependency-light for this step.
const ICONS = {
  Dashboard: '📊',
  Expenses: '🧾',
  Budget: '🎯',
  Shared: '🤝',
  Settings: '⚙️',
};

export default function MainTabs() {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.textPrimary, ...theme.typography.h3 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerTitle: () => <BrandHeader /> }}
      />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Shared" component={SharedExpensesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
