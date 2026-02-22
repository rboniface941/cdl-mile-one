import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BookOpen, Briefcase, CreditCard } from 'lucide-react-native';
import { useAuthContext } from '../lib/AuthContext';
import { useOnboarding } from '../lib/OnboardingContext';
import { COLORS, FONTS } from '../constants';

// Onboarding Screens
import StageSelectScreen from '../screens/onboarding/StageSelectScreen';
import OnboardingQuizScreen from '../screens/onboarding/OnboardingQuizScreen';
import OnboardingResultsScreen from '../screens/onboarding/OnboardingResultsScreen';

// Study Screens
import StudyCategoryScreen from '../screens/study/StudyCategoryScreen';
import PracticeScreen from '../screens/study/PracticeScreen';
import ExamSetupScreen from '../screens/study/ExamSetupScreen';
import ExamScreen from '../screens/study/ExamScreen';
import ExamResultsScreen from '../screens/study/ExamResultsScreen';

// Funding Screens
import FundingHomeScreen from '../screens/funding/FundingHomeScreen';

// Jobs Screens
import JobsHomeScreen from '../screens/jobs/JobsHomeScreen';
import ApplyAllScreen from '../screens/jobs/ApplyAllScreen';
import ApplySuccessScreen from '../screens/jobs/ApplySuccessScreen';
import ProfileBuilderScreen from '../screens/jobs/ProfileBuilderScreen';

// Profile Screen
import ProfileScreen from '../screens/profile/ProfileScreen';

// Admin Screens
import AdminLoansScreen from '../screens/admin/AdminLoansScreen';
import AdminApplicationsScreen from '../screens/admin/AdminApplicationsScreen';

// Interstitial
import InterstitialSheet from '../components/InterstitialSheet';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const StudyStack = createNativeStackNavigator();
const FundingStack = createNativeStackNavigator();
const JobsStack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: COLORS.navy },
};

function StudyStackNavigator() {
  return (
    <StudyStack.Navigator screenOptions={screenOptions}>
      <StudyStack.Screen name="StudyCategory" component={StudyCategoryScreen} />
      <StudyStack.Screen name="PracticeSession" component={PracticeScreen} />
      <StudyStack.Screen name="ExamSetup" component={ExamSetupScreen} />
      <StudyStack.Screen name="ExamSession" component={ExamScreen} />
      <StudyStack.Screen name="ExamResults" component={ExamResultsScreen} />
    </StudyStack.Navigator>
  );
}

function FundingStackNavigator() {
  return (
    <FundingStack.Navigator screenOptions={screenOptions}>
      <FundingStack.Screen name="FundingHome" component={FundingHomeScreen} />
    </FundingStack.Navigator>
  );
}

function JobsStackNavigator() {
  return (
    <JobsStack.Navigator screenOptions={screenOptions}>
      <JobsStack.Screen name="JobsHome" component={JobsHomeScreen} />
      <JobsStack.Screen name="ApplyAll" component={ApplyAllScreen} />
      <JobsStack.Screen name="ApplySuccess" component={ApplySuccessScreen} />
      <JobsStack.Screen name="ProfileBuilder" component={ProfileBuilderScreen} />
    </JobsStack.Navigator>
  );
}

function TabIcon({ name, focused, badge }: { name: string; focused: boolean; badge?: boolean }) {
  const icons: Record<string, React.ComponentType<any>> = {
    Study: BookOpen,
    Jobs: Briefcase,
    Funding: CreditCard,
  };
  const IconComponent = icons[name] || BookOpen;

  return (
    <View style={{ alignItems: 'center', paddingTop: 6 }}>
      <View>
        <IconComponent
          size={22}
          color={focused ? COLORS.amber : COLORS.slate}
          strokeWidth={focused ? 2.5 : 2}
        />
        {badge && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: -6,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: COLORS.amber,
            }}
          />
        )}
      </View>
      <Text
        style={{
          color: focused ? COLORS.amber : COLORS.slate,
          fontSize: 11,
          fontFamily: focused ? FONTS.semibold : FONTS.medium,
          marginTop: 4,
        }}
      >
        {name}
      </Text>
    </View>
  );
}

function MainTabs() {
  const { profile } = useAuthContext();
  const completeness = profile?.profile_completeness || 0;
  const showJobBadge = completeness >= 50;
  const isGraduated = profile?.stage === 'graduated';
  const [isFirstOpen, setIsFirstOpen] = useState(true);

  // For graduated users, Jobs is default on first open only
  useEffect(() => {
    if (isFirstOpen) {
      setIsFirstOpen(false);
    }
  }, []);

  return (
    <Tab.Navigator
      initialRouteName={isGraduated && isFirstOpen ? 'JobsTab' : 'StudyTab'}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.navy,
          borderTopColor: COLORS.navyMid,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="StudyTab"
        component={StudyStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Study" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="JobsTab"
        component={JobsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Jobs" focused={focused} badge={showJobBadge} />
          ),
        }}
      />
      {!isGraduated && (
        <Tab.Screen
          name="FundingTab"
          component={FundingStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name="Funding" focused={focused} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StageSelect" component={StageSelectScreen} />
      <Stack.Screen name="OnboardingQuiz" component={OnboardingQuizScreen} />
      <Stack.Screen name="OnboardingResults" component={OnboardingResultsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { session, profile, loading } = useAuthContext();
  const { state: onboardingState } = useOnboarding();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.amber} />
        <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.regular, marginTop: 12 }}>
          Loading...
        </Text>
      </View>
    );
  }

  const isAuthenticated = !!session && !!profile;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isAuthenticated ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="AdminLoans" component={AdminLoansScreen} />
            <Stack.Screen name="AdminApplications" component={AdminApplicationsScreen} />
          </>
        )}
      </Stack.Navigator>
      {isAuthenticated && <InterstitialSheet />}
    </NavigationContainer>
  );
}
