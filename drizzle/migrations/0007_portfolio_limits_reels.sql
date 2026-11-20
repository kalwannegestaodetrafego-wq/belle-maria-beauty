CREATE TABLE IF NOT EXISTS public.portfolio_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  reel_code text NOT NULL CHECK (reel_code ~ '^[A-Za-z0-9_-]{5,40}$'),
  title text NOT NULL DEFAULT '',
  service_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, reel_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_videos TO authenticated;
GRANT ALL ON public.portfolio_videos TO service_role;
ALTER TABLE public.portfolio_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads videos" ON public.portfolio_videos FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owner inserts videos" ON public.portfolio_videos FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner updates videos" ON public.portfolio_videos FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner deletes videos" ON public.portfolio_videos FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.bm_portfolio_limit_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(TG_TABLE_NAME || NEW.owner_id::text));
  IF TG_TABLE_NAME = 'portfolio_items' AND (SELECT count(*) FROM portfolio_items WHERE owner_id = NEW.owner_id) >= 12 THEN RAISE EXCEPTION 'photo limit reached'; END IF;
  IF TG_TABLE_NAME = 'portfolio_videos' THEN
    IF (SELECT count(*) FROM portfolio_videos WHERE owner_id = NEW.owner_id) >= 10 THEN RAISE EXCEPTION 'video limit reached'; END IF;
    IF NEW.service_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM services s WHERE s.id = NEW.service_id AND s.owner_id = NEW.owner_id) THEN RAISE EXCEPTION 'invalid service'; END IF;
    NEW.title := left(trim(coalesce(NEW.title, '')), 80);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER bm_portfolio_items_limit BEFORE INSERT ON public.portfolio_items FOR EACH ROW EXECUTE FUNCTION public.bm_portfolio_limit_guard();
CREATE TRIGGER bm_portfolio_videos_limit BEFORE INSERT ON public.portfolio_videos FOR EACH ROW EXECUTE FUNCTION public.bm_portfolio_limit_guard();

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
  'items', (SELECT coalesce(jsonb_agg(jsonb_build_object('id', i.id, 'imagePath', i.image_path, 'title', coalesce(nullif(i.title, ''), i.caption), 'tags', to_jsonb(i.tags), 'serviceId', i.service_id) ORDER BY i.created_at DESC), '[]') FROM portfolio_items i WHERE i.owner_id = p.id),
  'videos', (SELECT coalesce(jsonb_agg(jsonb_build_object('id', v.id, 'reelCode', v.reel_code, 'title', v.title, 'serviceId', v.service_id) ORDER BY v.created_at DESC), '[]') FROM portfolio_videos v WHERE v.owner_id = p.id)
) FROM profiles p WHERE p.public_slug = lower(_slug) AND p.account_type <> 'cliente' $$;
GRANT EXECUTE ON FUNCTION public.bm_public_portfolio(text) TO anon, authenticated;