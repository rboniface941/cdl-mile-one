-- Mile One CDL App — Supabase Schema
-- Run this in the Supabase SQL Editor to set up all tables

-- ============================================================
-- PROFILES (extends Supabase Auth users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  stage TEXT CHECK (stage IN ('researching', 'ready_to_enroll', 'in_school', 'graduated')),
  avatar_url TEXT,
  streak_count INTEGER DEFAULT 0,
  last_practice_date DATE,
  profile_completeness INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- QUESTIONS (CDL quiz bank)
-- ============================================================
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  category TEXT NOT NULL CHECK (category IN (
    'General Knowledge',
    'Air Brakes',
    'Combination Vehicles',
    'Hazmat',
    'Tanker',
    'Doubles/Triples',
    'Passenger',
    'Bus',
    'Pre-Trip Inspection',
    'Basic Controls'
  )),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  explanation TEXT
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
  ON questions FOR SELECT TO authenticated USING (true);

-- ============================================================
-- USER ANSWERS (quiz performance tracking)
-- ============================================================
CREATE TABLE user_answers (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer CHAR(1) NOT NULL,
  was_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_answers_user ON user_answers(user_id);
CREATE INDEX idx_user_answers_question ON user_answers(question_id);
CREATE INDEX idx_user_answers_date ON user_answers(answered_at);

ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own answers"
  ON user_answers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON user_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- LOAN APPLICATIONS (school funding leads)
-- ============================================================
CREATE TABLE loan_applications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  loan_amount INTEGER NOT NULL,
  employment_status TEXT NOT NULL,
  monthly_income INTEGER NOT NULL,
  zip_code TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'funded', 'declined'))
);

ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON loan_applications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON loan_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policy (create a service role or use admin check)
CREATE POLICY "Admins can view all applications"
  ON loan_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'admin@mileone.com'
    )
  );

CREATE POLICY "Admins can update applications"
  ON loan_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'admin@mileone.com'
    )
  );

-- ============================================================
-- DRIVER PROFILES (job seeker details)
-- ============================================================
CREATE TABLE driver_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Step 1: License info
  cdl_class TEXT CHECK (cdl_class IN ('A', 'B', 'C')),
  state_issued TEXT,
  endorsements TEXT[], -- Array of endorsement strings
  license_expiration DATE,

  -- Step 2: Job preferences
  job_type TEXT CHECK (job_type IN ('OTR', 'Regional', 'Local')),
  equipment_preference TEXT[],
  expected_salary INTEGER,
  willing_to_relocate BOOLEAN DEFAULT false,

  -- Step 3: Experience
  months_experience INTEGER DEFAULT 0,
  is_fresh_graduate BOOLEAN DEFAULT true,
  previous_employers JSONB DEFAULT '[]'::jsonb,

  -- Step 4: Violations
  has_accidents BOOLEAN DEFAULT false,
  accident_details TEXT,
  has_violations BOOLEAN DEFAULT false,
  violation_details TEXT,
  has_dui BOOLEAN DEFAULT false,

  -- Step 5: Address history
  current_address JSONB,
  previous_addresses JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own driver profile"
  ON driver_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can upsert own driver profile"
  ON driver_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own driver profile"
  ON driver_profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- CARRIERS (job listings)
-- ============================================================
CREATE TABLE carriers (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  job_title TEXT NOT NULL,
  pay_range TEXT NOT NULL,
  home_time TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  location TEXT NOT NULL,
  requirements TEXT,
  application_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active carriers"
  ON carriers FOR SELECT TO authenticated USING (is_active = true);

-- ============================================================
-- APPLICATIONS (job applications)
-- ============================================================
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  carrier_id INTEGER NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'interview', 'hired', 'rejected')),
  UNIQUE(user_id, carrier_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'admin@mileone.com'
    )
  );

CREATE POLICY "Admins can update applications"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'admin@mileone.com'
    )
  );

-- ============================================================
-- SEED DATA: Sample carriers
-- ============================================================
INSERT INTO carriers (company_name, logo_url, job_title, pay_range, home_time, equipment_type, location, requirements, is_active) VALUES
  ('Swift Transportation', NULL, 'OTR CDL-A Driver', '$65,000 - $85,000/yr', 'Every 2 weeks', 'Dry Van', 'Nationwide', 'CDL-A, Clean MVR', true),
  ('Werner Enterprises', NULL, 'Regional Driver', '$70,000 - $90,000/yr', 'Weekly', 'Dry Van', 'Southeast US', 'CDL-A, 3 months exp', true),
  ('Schneider National', NULL, 'Dedicated Driver', '$75,000 - $95,000/yr', 'Weekly', 'Dry Van', 'Midwest US', 'CDL-A, Clean MVR', true),
  ('J.B. Hunt Transport', NULL, 'Intermodal Driver', '$72,000 - $88,000/yr', 'Daily', 'Intermodal', 'Major metro areas', 'CDL-A, 6 months exp', true),
  ('KLLM Transport', NULL, 'Refrigerated OTR', '$70,000 - $92,000/yr', 'Every 2 weeks', 'Refrigerated', 'Nationwide', 'CDL-A, Clean MVR', true),
  ('Flatbed Carrier Inc', NULL, 'Flatbed Regional', '$75,000 - $100,000/yr', 'Weekly', 'Flatbed', 'East Coast', 'CDL-A, Flatbed exp preferred', true),
  ('Kenan Advantage Group', NULL, 'Tanker Driver', '$80,000 - $105,000/yr', 'Daily', 'Tanker', 'Southeast US', 'CDL-A, Tanker endorsement', true),
  ('FedEx Freight', NULL, 'Local P&D Driver', '$65,000 - $82,000/yr', 'Daily', 'Dry Van', 'Major metro areas', 'CDL-A, 1 year exp', true),
  ('Old Dominion Freight', NULL, 'Line Haul Driver', '$78,000 - $98,000/yr', 'Weekly', 'Dry Van', 'East Coast', 'CDL-A, Clean MVR', true),
  ('XPO Logistics', NULL, 'Regional LTL Driver', '$68,000 - $88,000/yr', 'Weekly', 'Dry Van', 'Nationwide', 'CDL-A, Doubles endorsement preferred', true);

-- ============================================================
-- SEED DATA: Sample questions (10 for onboarding quiz)
-- ============================================================
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, explanation) VALUES
  ('What is the minimum tread depth for front tires on a commercial vehicle?', '2/32 inch', '4/32 inch', '6/32 inch', '8/32 inch', 'B', 'Pre-Trip Inspection', 'medium', 'Front tires must have at least 4/32 inch tread depth. All other tires must have at least 2/32 inch.'),
  ('When driving in heavy traffic, the safest speed is:', 'Faster than other traffic', 'The posted speed limit', 'The speed of other traffic', 'Slower than other traffic', 'C', 'General Knowledge', 'easy', 'The safest speed in heavy traffic is the speed of the surrounding traffic flow. Going faster or slower creates dangerous speed differentials.'),
  ('The air brake system should build to full pressure in about:', '30 seconds', '1 minute', '2 minutes', '3 minutes', 'D', 'Air Brakes', 'medium', 'Air brake systems should build from 85 to 100 psi within 45 seconds. Building to full pressure from 0 should take about 3 minutes.'),
  ('Which of the following is the most common cause of truck fires?', 'Electrical problems', 'Under-inflated tires', 'Fuel leaks', 'Smoking', 'B', 'General Knowledge', 'medium', 'Under-inflated tires and duals that touch are the most common causes of truck fires. Check tire pressure regularly.'),
  ('When coupling a tractor to a semi-trailer, the fifth wheel should be:', 'Tilted forward', 'Tilted back', 'Level or tilted slightly forward', 'It doesn''t matter', 'B', 'Combination Vehicles', 'medium', 'The fifth wheel should be tilted slightly back (toward the rear of the tractor) so the trailer kingpin can engage properly.'),
  ('Hazardous materials placards must be at least:', '6 inches square', '8 inches square', '10 3/4 inches square', '12 inches square', 'C', 'Hazmat', 'medium', 'Hazardous materials placards must be diamond-shaped, at least 10 3/4 inches (273 mm) square, placed on point.'),
  ('The purpose of the spring brakes is to:', 'Hold the parking brake', 'Increase stopping power', 'Reduce brake fade', 'Cool the brakes', 'A', 'Air Brakes', 'easy', 'Spring brakes are held back by air pressure during driving. When air pressure is released (or drops too low), the springs apply the brakes, serving as the parking brake.'),
  ('When making a right turn with a long vehicle, you should:', 'Turn wide before the turn', 'Turn wide as you complete the turn', 'Stay close to the curb throughout', 'Use the left lane to make the turn', 'B', 'Basic Controls', 'medium', 'With long vehicles, you should keep the rear wheels close to the curb by turning wide as you complete the turn, not before it. This prevents off-tracking into adjacent lanes.'),
  ('A tanker vehicle is most likely to roll over when:', 'It is fully loaded', 'It is empty', 'It is partially loaded', 'It is carrying a light load', 'C', 'Tanker', 'medium', 'Partially loaded tankers are most dangerous because the liquid surge effect is greatest. The liquid can shift and create a strong force that rolls the vehicle.'),
  ('You are driving a set of doubles. The rear trailer starts to skid. You should:', 'Accelerate slightly', 'Release the brakes', 'Apply more brakes', 'Steer in the opposite direction', 'B', 'Doubles/Triples', 'medium', 'If any trailer starts to skid, release the brakes to regain traction. Applying more brakes will worsen the skid.'),
  -- Additional questions for quiz module
  ('The governor on an air brake system controls:', 'Air pressure in the system', 'The speed of the vehicle', 'Brake application force', 'Engine RPM during braking', 'A', 'Air Brakes', 'easy', 'The governor controls when the air compressor pumps air into the system, typically cutting in around 100 psi and cutting out around 125 psi.'),
  ('How often should you drain air tanks that do not have automatic drain valves?', 'Once a week', 'Once a month', 'At the end of each day of driving', 'Every oil change', 'C', 'Air Brakes', 'easy', 'You should drain air tanks at the end of each day of driving. Water and oil accumulate in the tanks and can damage the braking system.'),
  ('What is the most important reason for doing a pre-trip inspection?', 'Federal and state laws require it', 'To avoid being placed out of service', 'For your safety and the safety of others', 'To check tire pressure', 'C', 'Pre-Trip Inspection', 'easy', 'While inspections are legally required, the most important reason is safety. Finding and fixing problems before driving prevents breakdowns and crashes.'),
  ('The total stopping distance for a truck traveling at 55 mph is approximately:', '100 feet', '200 feet', '300 feet', '400 feet or more', 'D', 'General Knowledge', 'medium', 'At 55 mph, total stopping distance (perception + reaction + braking) is approximately 400+ feet — nearly the length of a football field.'),
  ('Bridges usually freeze:', 'At the same time as roads', 'After the roads freeze', 'Before other road surfaces', 'Only in winter months', 'C', 'General Knowledge', 'easy', 'Bridges freeze before other road surfaces because cold air circulates both above and below the bridge surface, cooling it faster.'),
  ('Overloading your vehicle can have all of the following effects EXCEPT:', 'Brake failure', 'Improved traction', 'Tire failure', 'Steering problems', 'B', 'General Knowledge', 'easy', 'Overloading causes brake failure (overworked brakes), tire failure (excess heat/pressure), and steering problems. It does NOT improve traction — it makes the vehicle harder to control.'),
  ('When should you downshift before a curve?', 'While in the curve', 'After the curve', 'Before you enter the curve', 'Anytime is fine', 'C', 'Basic Controls', 'easy', 'Always downshift before entering a curve. Downshifting in a curve can cause a skid because of the engine braking effect on the drive wheels.'),
  ('The crack-the-whip effect is most dangerous with:', 'Tractor-trailers', 'Straight trucks', 'Double/triple trailers', 'Tank vehicles', 'C', 'Doubles/Triples', 'medium', 'The crack-the-whip effect occurs when a sudden steering input at the tractor amplifies through each trailing unit. Doubles and triples are most susceptible.'),
  ('Which endorsement do you need to haul propane?', 'N (Tanker)', 'H (Hazmat)', 'X (Tanker and Hazmat)', 'P (Passenger)', 'C', 'Hazmat', 'medium', 'Propane is both a hazardous material and typically transported in a tanker. You need the X endorsement, which combines both Tanker (N) and Hazmat (H).'),
  ('What is off-tracking?', 'When the rear wheels follow a different path than the front wheels', 'When the truck slides sideways', 'When the trailer disconnects', 'When the truck goes off road', 'A', 'Combination Vehicles', 'easy', 'Off-tracking occurs when the rear wheels of a combination vehicle follow a tighter path than the front wheels in a turn. The longer the vehicle, the more off-tracking.'),
  ('During a pre-trip inspection, you should check the oil level:', 'Only if the oil light is on', 'Only on older trucks', 'Every time you inspect the vehicle', 'Only before long trips', 'C', 'Pre-Trip Inspection', 'easy', 'Oil level should be checked during every pre-trip inspection. Running with low oil can destroy the engine.'),
  ('If your brakes fail on a downgrade, you should:', 'Pump the brake pedal rapidly', 'Downshift to the lowest gear possible', 'Look for an escape ramp or route', 'Turn off the engine', 'C', 'General Knowledge', 'medium', 'Escape ramps are specifically designed for vehicles with brake failure on downgrades. They use loose gravel or an uphill grade to slow and stop vehicles safely.'),
  ('The "__(blank)__" endorsement is required to pull double or triple trailers.', 'T', 'N', 'X', 'H', 'A', 'Doubles/Triples', 'easy', 'The T endorsement (Doubles/Triples) is required to pull two or three trailers at once.'),
  ('You are loading a tanker truck. You should NEVER:', 'Use the dome or top loading method', 'Overload the tank', 'Check the weight after loading', 'Use splash loading for non-flammable liquids', 'B', 'Tanker', 'easy', 'Never overload a tanker. Too much liquid eliminates the outage (air space) needed for liquid expansion. This can cause the tank to burst.'),
  ('What is the purpose of a header board (headache rack)?', 'To mount lights on the cab', 'To protect the driver from cargo shifting forward', 'To improve aerodynamics', 'To mount communication equipment', 'B', 'General Knowledge', 'medium', 'The header board (headache rack) protects the driver from the cargo shifting forward in a crash or sudden stop.'),
  ('During the driving test, shifting gears in an intersection is:', 'Required for safety', 'Acceptable if traffic is light', 'Not recommended', 'Required by law', 'C', 'Basic Controls', 'easy', 'You should not shift gears while crossing an intersection. You need both hands on the wheel and full control. Select the proper gear before entering.'),
  ('Which of these statements about combination vehicle air brakes is true?', 'The trailer brakes should apply before the tractor brakes', 'Trailer air lines have two sections: service and emergency', 'Combination vehicles need more stopping distance', 'All of the above', 'D', 'Combination Vehicles', 'hard', 'All statements are true. Trailer brakes apply first via the relay valve, there are two air line sections, and combination vehicles need significantly more stopping distance.'),
  ('Stab braking is:', 'Applying the brakes hard then releasing when wheels lock', 'Lightly tapping the brakes', 'Holding the brakes throughout the stop', 'Using only the trailer brakes', 'A', 'Air Brakes', 'medium', 'Stab braking involves applying brakes fully, releasing when wheels lock, then reapplying when the wheels start rolling again. This is for vehicles without ABS.'),
  ('Cargo that is loaded against the rear door of a trailer:', 'Should be braced or locked', 'Is acceptable if properly stacked', 'Doesn''t require special attention', 'Should always be the lightest cargo', 'A', 'General Knowledge', 'medium', 'Cargo loaded against the rear doors should be braced or locked to prevent it from falling out when doors are opened. This is a common source of injuries.'),
  ('What is the maximum distance between the rear of a trailer and a rear reflector?', '6 inches', '12 inches', '24 inches', '36 inches', 'B', 'Pre-Trip Inspection', 'hard', 'Rear reflectors must be within 12 inches of the rear of the trailer and at least 15 inches above the road surface.');
