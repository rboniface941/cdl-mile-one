import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BookOpen, Banknote, Briefcase } from 'lucide-react-native';
import { useAuthContext } from '../lib/AuthContext';
import { useOnboarding } from '../lib/OnboardingContext';
import { COLORS, FONTS } from '../constants';

// Onboarding Screens
import StageSelectScreen from '../screens/onboarding/StageSelectScreen';
import OnboardingQuizScreen from '../screens/onboarding/OnboardingQuizScreen';
import OnboardingResultsScreen from '../screens/onboarding/OnboardingResultsScreen';

// Quiz Screens
import QuizHomeScreen from '../screens/quiz/QuizHomeScreen';
import QuizSessionScreen from '../screens/quiz/QuizSessionScreen';
import CategorySelectScreen from '../screens/quiz/CategorySelectScreen';
import QuizResultsScreen from '../screens/quiz/QuizResultsScreen';

// Funding Screens
import FundingHomeScreen from '../screens/funding/FundingHomeScreen';
import FundingApplicationScreen from '../screens/funding/FundingApplicationScreen';
import FundingConfirmationScreen from '../screens/funding/FundingConfirmationScreen';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const QuizStack = createNativeStackNavigator();
const FundingStack = createNativeStackNavigator();
const JobsStack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: COLORS.navy },
};

function QuizStackNavigator() {
  return (
    <QuizStack.Navigator screenOptions={screenOptions}>
      <QuizStack.Screen name="QuizHome" component={QuizHomeScreen} />
      <QuizStack.Screen name="QuizSession" component={QuizSessionScreen} />
      <QuizStack.Screen name="DailyPractice" component={DailyPracticeEntry} />
      <QuizStack.Screen name="MockExam" component={MockExamEntry} />
      <QuizStack.Screen name="CategorySelect" component={CategorySelectScreen} />
      <QuizStack.Screen name="QuizResults" component={QuizResultsScreen} />
    </QuizStack.Navigator>
  );
}

function DailyPracticeEntry({ navigation }: any) {
  React.useEffect(() => {
    navigation.replace('QuizSession', { mode: 'daily' });
  }, []);
  return null;
}

function MockExamEntry({ navigation }: any) {
  React.useEffect(() => {
    navigation.replace('QuizSession', { mode: 'mock' });
  }, []);
  return null;
}

function FundingStackNavigator() {
  return (
    <FundingStack.Navigator screenOptions={screenOptions}>
      <FundingStack.Screen name="FundingHome" component={FundingHomeScreen} />
      <FundingStack.Screen name="FundingApplication" component={FundingApplicationScreen} />
      <FundingStack.Screen name="FundingConfirmation" component={FundingConfirmationScreen} />
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

const TAB_ICONS: Record<string, React.ComponentType<any>> = {
  Study: BookOpen,
  Funding: Banknote,
  Jobs: Briefcase,
};

function TabIcon({ name, focused, badge }: { name: string; focused: boolean; badge?: boolean }) {
  const IconComponent = TAB_ICONS[name] || BookOpen;

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
  const showJobBadge = (profile?.profile_completeness || 0) >= 100;

  return (
    <Tab.Navigator
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
        component={QuizStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Study" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="FundingTab"
        component={FundingStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Funding" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="JobsTab"
        component={JobsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Jobs" focused={focused} badge={showJobBadge} />,
        }}
      />
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
            <Stack.Screen name="ProfileBuilder" component={ProfileBuilderScreen} />
            <Stack.Screen name="AdminLoans" component={AdminLoansScreen} />
            <Stack.Screen name="AdminApplications" component={AdminApplicationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
