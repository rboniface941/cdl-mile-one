import { QuizCategory } from '../types';

export const COLORS = {
  navy: '#0F172A',
  navyLight: '#1E293B',
  navyMid: '#334155',
  amber: '#F59E0B',
  amberDark: '#D97706',
  amberLight: '#FDE68A',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
};

export const QUIZ_CATEGORIES: QuizCategory[] = [
  'General Knowledge',
  'Air Brakes',
  'Combination Vehicles',
  'Hazmat',
  'Tanker',
  'Doubles/Triples',
  'Pre-Trip Inspection',
  'Basic Controls',
];

export const CDL_STAGES = [
  { value: 'researching', label: 'Just researching', emoji: '🔍' },
  { value: 'ready_to_enroll', label: 'Ready to enroll in school', emoji: '📝' },
  { value: 'in_school', label: 'Currently in school', emoji: '📚' },
  { value: 'graduated', label: 'Recently graduated', emoji: '🎓' },
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
