-- ═══════════════════════════════════════════════════════════════
-- KERA GROUP — მინიმალური გამოსწორება (Supabase → SQL Editor → Run)
-- ═══════════════════════════════════════════════════════════════

-- A) ძველი ცხრილის სახელის შეცვლა (თუ cadastral_code სვეტი არ არსებობს)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'properties'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'properties'
      AND column_name = 'cadastral_code'
  ) THEN
    ALTER TABLE public.properties RENAME TO properties_legacy;
  END IF;
END $$;

-- B) area_sqm-ის დამატება (თუ ძველი ცხრილი დარჩა)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS area_sqm numeric;

-- C) profiles ცხრილი (რეგისტრაციისთვის)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text,
  role text NOT NULL DEFAULT 'user',
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- D) ახალი properties ცხრილი (სრული სისტემა)
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cadastral_code text NOT NULL,
  owner_first_name text NOT NULL,
  owner_last_name text NOT NULL,
  address text NOT NULL,
  phone_number text NOT NULL,
  total_price numeric NOT NULL CHECK (total_price >= 0),
  area_sqm numeric NOT NULL CHECK (area_sqm > 0),
  price_per_sqm numeric GENERATED ALWAYS AS (
    CASE WHEN area_sqm > 0 THEN round(total_price / area_sqm, 2) ELSE NULL END
  ) STORED,
  listing_type text NOT NULL CHECK (listing_type IN ('sale', 'rent')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
  latitude double precision,
  longitude double precision,
  geojson_polygon jsonb,
  images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert own properties" ON public.properties;
CREATE POLICY "Authenticated users can insert own properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Owners can view own properties" ON public.properties;
CREATE POLICY "Owners can view own properties"
  ON public.properties FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
CREATE POLICY "Anyone can view active properties"
  ON public.properties FOR SELECT USING (status = 'active');

-- E) Schema cache განახლება
NOTIFY pgrst, 'reload schema';
