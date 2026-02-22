import { QuizCategory } from '../types';

export const COLORS = {
  navy: '#0F172A',
  navyLight: '#1E293B',
  navyMid: '#334155',
  amber: '#F59E0B',
  white: '#FFFFFF',
  slate: '#94A3B8',
  success: '#22C55E',
  error: '#EF4444',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
};

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  screenPadding: 24,
  cardPadding: 20,
};

export const QUIZ_CATEGORIES: QuizCategory[] = [
  'General Knowledge',
  'Air Brakes',
  'Combination Vehicles',
  'Hazmat',
  'Tanker',
  'Doubles/Triples',
  'Passenger',
  'Bus',
  'Pre-Trip Inspection',
  'Basic Controls',
];

export const CDL_STAGES = [
  { value: 'researching', label: 'Just researching' },
  { value: 'ready_to_enroll', label: 'Ready to enroll in school' },
  { value: 'in_school', label: 'Currently in school' },
  { value: 'graduated', label: 'Recently graduated' },
] as const;

export const ENDORSEMENTS = [
  'HazMat',
  'Tanker',
  'Doubles/Triples',
  'Passenger',
  'School Bus',
];

export const EQUIPMENT_TYPES = [
  'Dry Van',
  'Flatbed',
  'Refrigerated',
  'Tanker',
  'Specialized',
];

export const JOB_TYPES = ['OTR', 'Regional', 'Local'] as const;

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

export const MOCK_EXAM_COUNT = 50;
export const DAILY_PRACTICE_COUNT = 20;
export const ONBOARDING_QUIZ_COUNT = 10;
export const MOCK_EXAM_MINUTES = 60;
