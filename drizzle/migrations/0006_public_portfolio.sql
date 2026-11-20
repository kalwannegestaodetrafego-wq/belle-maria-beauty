ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_slug text, ADD COLUMN IF NOT EXISTS specialty text, ADD COLUMN IF NOT EXISTS neighborhoods text[] NOT NULL DEFAULT '{}', ADD COLUMN IF NOT EXISTS avatar_path text;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_public_slug_format CHECK (public_slug IS NULL OR (public_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(public_slug) BETWEEN 3 AND 40));
CREATE UNIQUE INDEX IF NOT EXISTS profiles_public_slug_key ON public.profiles (public_slug);
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS title text, ADD COLUMN IF NOT EXISTS service_id uuid, ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.bm_portfolio_item_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.service_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM services s WHERE s.id = NEW.service_id AND s.owner_id = NEW.owner_id) THEN RAISE EXCEPTION 'invalid service'; END IF;
  NEW.title := left(trim(coalesce(NEW.title, '')), 80);
  NEW.tags := (SELECT coalesce(array_agg(DISTINCT left(lower(t), 30)), '{}') FROM unnest(NEW.tags) t WHERE trim(t) <> '');
  IF array_length(NEW.tags, 1) > 12 THEN RAISE EXCEPTION 'too many tags'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER bm_portfolio_item_guard BEFORE INSERT OR UPDATE ON public.portfolio_items FOR EACH ROW EXECUTE FUNCTION public.bm_portfolio_item_guard();

CREATE OR REPLACE FUNCTION public.bm_public_portfolio(_slug text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
SELECT jsonb_build_object(
  'id', p.id, 'slug', p.public_slug, 'name', coalesce(p.full_name, 'Profissional BM'), 'specialty', p.specialty, 'bio', p.bio,
  'salon', p.salon_name, 'accountType', p.account_type, 'avatar', p.avatar_path, 'neighborhoods', to_jsonb(p.neighborhoods),
  'verified', p.verification_status = 'VERIFICADO',
  'founder', (SELECT count(*) FROM profiles q WHERE q.public_slug IS NOT NULL AND q.account_type <> 'cliente' AND q.created_at < p.created_at) < 50,
  'rating', (SELECT round(avg(r.rating)::numeric, 1) FROM reviews r WHERE r.professional_id = p.id AND r.visibility = 'public'),
  'reviewCount', (SELECT count(*) FROM reviews r WHERE r.professional_id = p.id AND r.visibility = 'public'),
  'reviews', (SELECT coalesce(jsonb_agg(jsonb_build_object('rating', r.rating, 'comment', r.comment, 'createdAt', r.created_at)), '[]') FROM (SELECT * FROM reviews r WHERE r.professional_id = p.id AND r.visibility = 'public' ORDER BY r.created_at DESC LIMIT 6) r),
  'services', (SELECT coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'priceCents', s.price_cents, 'durationMin', s.duration_min) ORDER BY s.price_cents), '[]') FROM services s WHERE s.owner_id = p.id AND s.active),
  'items', (SELECT coalesce(jsonb_agg(jsonb_build_object('id', i.id, 'imagePath', i.image_path, 'title', coalesce(nullif(i.title, ''), i.caption), 'tags', to_jsonb(i.tags), 'serviceId', i.service_id) ORDER BY i.created_at DESC), '[]') FROM portfolio_items i WHERE i.owner_id = p.id)
) FROM profiles p WHERE p.public_slug = lower(_slug) AND p.account_type <> 'cliente' $$;

CREATE OR REPLACE FUNCTION public.bm_portfolio_catalog() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
SELECT coalesce(jsonb_agg(x), '[]') FROM (
  SELECT jsonb_build_object('slug', p.public_slug, 'name', coalesce(p.full_name, 'Profissional BM'), 'specialty', p.specialty, 'neighborhoods', to_jsonb(p.neighborhoods),
    'looks', (SELECT coalesce(jsonb_agg(jsonb_build_object('title', i.title, 'tags', to_jsonb(i.tags))), '[]') FROM (SELECT * FROM portfolio_items i WHERE i.owner_id = p.id ORDER BY i.created_at DESC LIMIT 12) i),
    'services', (SELECT coalesce(jsonb_agg(jsonb_build_object('name', s.name, 'priceCents', s.price_cents)), '[]') FROM (SELECT * FROM services s WHERE s.owner_id = p.id AND s.active LIMIT 6) s)) x
  FROM profiles p WHERE p.public_slug IS NOT NULL AND p.account_type <> 'cliente' AND EXISTS (SELECT 1 FROM portfolio_items i WHERE i.owner_id = p.id)
  ORDER BY p.created_at LIMIT 30) t $$;

CREATE OR REPLACE FUNCTION public.bm_is_public_portfolio_object(_name text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
SELECT EXISTS (SELECT 1 FROM portfolio_items i JOIN profiles p ON p.id = i.owner_id WHERE i.image_path = _name AND p.public_slug IS NOT NULL)
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.avatar_path = _name AND p.public_slug IS NOT NULL) $$;

REVOKE EXECUTE ON FUNCTION public.bm_portfolio_catalog() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bm_portfolio_catalog() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bm_public_portfolio(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bm_is_public_portfolio_object(text) TO anon, authenticated;

CREATE POLICY "Public portfolio files read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio' AND public.bm_is_public_portfolio_object(name));