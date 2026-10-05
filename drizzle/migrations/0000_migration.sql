CREATE TYPE public.account_type AS ENUM ('cliente', 'profissional', 'salao');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  account_type public.account_type NOT NULL DEFAULT 'cliente',
  full_name text,
  cpf text,
  cnpj text,
  phone text,
  address text,
  residence_details text,
  salon_name text,
  bio text,
  selfie_path text,
  identity_doc_path text,
  verification_status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  image_path text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_items TO authenticated;
GRANT ALL ON public.portfolio_items TO service_role;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Portfolio public read" ON public.portfolio_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Portfolio own insert" ON public.portfolio_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Portfolio own update" ON public.portfolio_items FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Portfolio own delete" ON public.portfolio_items FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "Selfies own read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'selfies' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Selfies own upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'selfies' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Portfolio file read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
CREATE POLICY "Portfolio own upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Portfolio own file delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);