export type CDLStage = 'researching' | 'ready_to_enroll' | 'in_school' | 'graduated';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  stage: CDLStage | null;
  avatar_url: string | null;
  streak_count: number;
  last_practice_date: string | null;
  profile_completeness: number;
  current_interstitial_index: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  category: QuizCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string | null;
}

export type QuizCategory =
  | 'General Knowledge'
  | 'Air Brakes'
  | 'Combination Vehicles'
  | 'Hazmat'
  | 'Tanker'
  | 'Doubles/Triples'
  | 'Passenger'
  | 'Bus'
  | 'Pre-Trip Inspection'
  | 'Basic Controls';

export interface UserAnswer {
  id: number;
  user_id: string;
  question_id: number;
  selected_answer: string;
  was_correct: boolean;
  answered_at: string;
}

export interface QuizSession {
  id: string;
  category: QuizCategory;
  mode: 'practice' | 'exam';
  score: number;
  total: number;
  timeSeconds: number;
  completedAt: string;
}

export interface LoanApplication {
  id: number;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  loan_amount: number;
  employment_status: string;
  monthly_income: number;
  zip_code: string;
  submitted_at: string;
  status: 'new' | 'contacted' | 'funded' | 'declined';
}

export interface DriverProfile {
  id: string;
  cdl_class: 'A' | 'B' | 'C' | null;
  state_issued: string | null;
  endorsements: string[];
  license_expiration: string | null;
  job_type: 'OTR' | 'Regional' | 'Local' | null;
  equipment_preference: string[];
  expected_salary: number | null;
  willing_to_relocate: boolean;
  months_experience: number;
  is_fresh_graduate: boolean;
  previous_employers: Employer[];
  has_accidents: boolean;
  accident_details: string | null;
  has_violations: boolean;
  violation_details: string | null;
  has_dui: boolean;
  current_address: Address | null;
  previous_addresses: Address[];
  created_at: string;
  updated_at: string;
}

export interface Employer {
  name: string;
  start_date: string;
  end_date: string;
  equipment_operated: string;
  reason_for_leaving: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Carrier {
  id: number;
  company_name: string;
  logo_url: string | null;
  job_title: string;
  pay_range: string;
  home_time: string;
  equipment_type: string;
  location: string;
  requirements: string | null;
  application_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Application {
  id: number;
  user_id: string;
  carrier_id: number;
  applied_at: string;
  status: 'submitted' | 'reviewed' | 'interview' | 'hired' | 'rejected';
  carrier?: Carrier;
  profile?: Profile;
}

export interface CategoryStats {
  category: QuizCategory;
  total: number;
  correct: number;
  percentage: number;
}

export interface InterstitialQuestion {
  index: number;
  type: 'bottom-sheet' | 'full-screen';
  title: string;
  subtext: string;
  inputType: 'dropdown' | 'single-select' | 'multi-select' | 'numeric-input';
  options?: string[];
  field: string;
}
