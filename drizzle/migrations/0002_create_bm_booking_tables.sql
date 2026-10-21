-- =====================================================================
-- BM: persistent services, bookings, reviews, wallet and withdrawals
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Services managed by a professional / salon account
-- ---------------------------------------------------------------------
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  duration_min integer NOT NULL DEFAULT 60,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_name_check CHECK (char_length(btrim(name)) BETWEEN 1 AND 80),
  CONSTRAINT services_price_check CHECK (price_cents >= 0 AND price_cents <= 100000000),
  CONSTRAINT services_duration_check CHECK (duration_min BETWEEN 5 AND 1440)
);
CREATE INDEX services_owner_created_idx ON public.services (owner_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services owner insert" ON public.services FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Services owner select" ON public.services FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Services owner update" ON public.services FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Services owner delete" ON public.services FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER services_touch_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 2. Bookings (escrow protected, released with the 4 digit service PIN)
-- ---------------------------------------------------------------------
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  professional_id uuid,
  client_name text,
  professional_name text NOT NULL,
  salon_name text,
  service_name text NOT NULL,
  category text,
  address text,
  residence_details text,
  notes text,
  scheduled_for timestamp with time zone,
  preferred_times text,
  status text NOT NULL DEFAULT 'new',
  payment_method text NOT NULL DEFAULT 'pix',
  payment_status text NOT NULL DEFAULT 'escrow',
  amount_cents integer NOT NULL DEFAULT 0,
  fee_cents integer NOT NULL DEFAULT 0,
  urgency_fee boolean NOT NULL DEFAULT false,
  receipt_code text,
  service_pin text NOT NULL DEFAULT '8392',
  checklist_infra boolean NOT NULL DEFAULT false,
  checklist_materials boolean NOT NULL DEFAULT false,
  checklist_pets boolean NOT NULL DEFAULT false,
  checklist_terms boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_status_check CHECK (status IN ('new', 'accepted', 'enroute', 'arrived', 'completed', 'cancelled', 'dispute')),
  CONSTRAINT bookings_payment_status_check CHECK (payment_status IN ('escrow', 'released', 'refunded')),
  CONSTRAINT bookings_amount_check CHECK (amount_cents >= 0 AND amount_cents <= 100000000),
  CONSTRAINT bookings_fee_check CHECK (fee_cents >= 0 AND fee_cents <= 100000000),
  CONSTRAINT bookings_pin_check CHECK (char_length(service_pin) = 4)
);
CREATE INDEX bookings_client_created_idx ON public.bookings (client_id, created_at DESC);
CREATE INDEX bookings_professional_created_idx ON public.bookings (professional_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bookings client insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Bookings client select" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Bookings professional select" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = professional_id);
CREATE POLICY "Bookings client update" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Bookings professional update" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = professional_id) WITH CHECK (auth.uid() = professional_id);
CREATE POLICY "Bookings client delete" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() = client_id AND status = 'cancelled');

CREATE TRIGGER bookings_touch_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 3. Reviews (1 to 5 stars, one per booking)
-- ---------------------------------------------------------------------
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  author_id uuid NOT NULL,
  professional_id uuid,
  professional_name text,
  rating integer NOT NULL,
  comment text,
  tags text,
  photo_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_booking_fk FOREIGN KEY (booking_id) REFERENCES public.bookings (id) ON DELETE CASCADE,
  CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_one_per_booking UNIQUE (booking_id, author_id)
);
CREATE INDEX reviews_professional_created_idx ON public.reviews (professional_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews author insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.client_id = auth.uid() AND b.status = 'completed'));
CREATE POLICY "Reviews author select" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Reviews professional select" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = professional_id);
CREATE POLICY "Reviews author update" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Reviews author delete" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- ---------------------------------------------------------------------
-- 4. Wallet entries (escrow, earnings, withdrawals, fees)
-- ---------------------------------------------------------------------
CREATE TABLE public.wallet_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  kind text NOT NULL,
  amount_cents integer NOT NULL,
  label text NOT NULL,
  booking_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT wallet_entries_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_entries_kind_check CHECK (kind IN ('escrow', 'earning', 'withdrawal', 'fee', 'refund')),
  CONSTRAINT wallet_entries_amount_check CHECK (amount_cents >= 0 AND amount_cents <= 100000000),
  CONSTRAINT wallet_entries_booking_fk FOREIGN KEY (booking_id) REFERENCES public.bookings (id) ON DELETE SET NULL
);
CREATE INDEX wallet_entries_owner_created_idx ON public.wallet_entries (owner_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallet_entries TO authenticated;
GRANT ALL ON public.wallet_entries TO service_role;

ALTER TABLE public.wallet_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wallet owner insert" ON public.wallet_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Wallet owner select" ON public.wallet_entries FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Wallet owner update" ON public.wallet_entries FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Wallet owner delete" ON public.wallet_entries FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- ---------------------------------------------------------------------
-- 5. PIX withdrawal requests
-- ---------------------------------------------------------------------
CREATE TABLE public.withdrawals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  amount_cents integer NOT NULL,
  pix_key text,
  status text NOT NULL DEFAULT 'requested',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT withdrawals_pkey PRIMARY KEY (id),
  CONSTRAINT withdrawals_amount_check CHECK (amount_cents > 0 AND amount_cents <= 100000000),
  CONSTRAINT withdrawals_status_check CHECK (status IN ('requested', 'paid', 'cancelled'))
);
CREATE INDEX withdrawals_owner_created_idx ON public.withdrawals (owner_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Withdrawals owner insert" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Withdrawals owner select" ON public.withdrawals FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Withdrawals owner update" ON public.withdrawals FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Withdrawals owner delete" ON public.withdrawals FOR DELETE TO authenticated USING (auth.uid() = owner_id);