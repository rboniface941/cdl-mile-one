import { QuizCategory, InterstitialQuestion } from '../types';

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

// All categories in DB
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

// Categories shown in Study tab
export const STUDY_CATEGORIES: QuizCategory[] = [
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

export const INTERSTITIAL_QUESTIONS: InterstitialQuestion[] = [
  {
    index: 0,
    type: 'bottom-sheet',
    title: 'What state is your CDL issued in?',
    subtext: "We'll prioritize state-specific rules in your practice questions.",
    inputType: 'dropdown',
    options: US_STATES,
    field: 'state_issued',
  },
  {
    index: 1,
    type: 'bottom-sheet',
    title: 'What CDL class are you going for?',
    subtext: "We'll focus your practice on the right exam sections.",
    inputType: 'single-select',
    options: ['Class A', 'Class B', 'Class C'],
    field: 'cdl_class',
  },
  {
    index: 2,
    type: 'bottom-sheet',
    title: 'Planning to add any endorsements?',
    subtext: "Endorsements unlock higher-paying routes — we'll prep you for those tests too.",
    inputType: 'multi-select',
    options: ['HazMat', 'Tanker', 'Doubles/Triples', 'Passenger', 'School Bus', 'None'],
    field: 'endorsements',
  },
  {
    index: 3,
    type: 'bottom-sheet',
    title: 'What kind of driving job interests you?',
    subtext: "We'll match you with carriers that fit your schedule.",
    inputType: 'single-select',
    options: ['OTR', 'Regional', 'Local'],
    field: 'job_type',
  },
  {
    index: 4,
    type: 'bottom-sheet',
    title: "What's your home zip code?",
    subtext: "We'll show carriers hiring in your area.",
    inputType: 'numeric-input',
    field: 'home_zip',
  },
  {
    index: 5,
    type: 'bottom-sheet',
    title: 'How much CDL experience do you have?',
    subtext: 'Many carriers have strong trainee programs for newer drivers.',
    inputType: 'single-select',
    options: ['Fresh Graduate', 'Under 1 Year', '1-2 Years', '2+ Years'],
    field: 'experience_level',
  },
  {
    index: 6,
    type: 'bottom-sheet',
    title: 'What equipment do you prefer?',
    subtext: "We'll filter your job matches to what you actually want to haul.",
    inputType: 'multi-select',
    options: ['Dry Van', 'Flatbed', 'Refrigerated', 'Tanker', 'Specialized'],
    field: 'equipment_preference',
  },
  {
    index: 7,
    type: 'full-screen',
    title: 'Your driver profile is ready.',
    subtext: '8 carriers are actively hiring drivers with your experience and preferences.',
    inputType: 'single-select',
    field: 'profile_ready',
  },
];
