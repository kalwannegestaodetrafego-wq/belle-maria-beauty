DROP POLICY IF EXISTS "Portfolio public read" ON public.portfolio_items;

CREATE POLICY "Portfolio own read"
ON public.portfolio_items
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Portfolio file read" ON storage.objects;

CREATE POLICY "Portfolio own file read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'portfolio'::text
  AND (auth.uid())::text = (storage.foldername(name))[1]
);