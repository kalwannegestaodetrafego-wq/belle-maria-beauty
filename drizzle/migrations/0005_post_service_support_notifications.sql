ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';
UPDATE public.reviews SET visibility = CASE WHEN rating >= 4 THEN 'public' ELSE 'private' END;

CREATE OR REPLACE FUNCTION public.bm_review_visibility() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN RAISE EXCEPTION 'invalid rating'; END IF;
  NEW.visibility := CASE WHEN NEW.rating >= 4 THEN 'public' ELSE 'private' END;
  RETURN NEW;
END $$;
CREATE TRIGGER bm_review_visibility BEFORE INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.bm_review_visibility();

GRANT SELECT ON public.reviews TO anon;
CREATE POLICY "Public positive reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (visibility = 'public');
CREATE POLICY "Admin reviews read" ON public.reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.client_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL,
  client_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  payment_received boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.client_ratings TO authenticated;
GRANT ALL ON public.client_ratings TO service_role;
ALTER TABLE public.client_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client rating pro insert" ON public.client_ratings FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = professional_id AND EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.professional_id = auth.uid() AND b.client_id = client_ratings.client_id AND b.status = 'completed'));
CREATE POLICY "Client rating pro read" ON public.client_ratings FOR SELECT TO authenticated USING (auth.uid() = professional_id);
CREATE POLICY "Client rating admin read" ON public.client_ratings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  author_role text NOT NULL CHECK (author_role IN ('client','professional')),
  category text NOT NULL CHECK (category IN ('payment_missing','disrespect','forgot_item','incomplete_service','lost_item')),
  message text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tickets own insert" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND status = 'open' AND admin_reply IS NULL);
CREATE POLICY "Tickets own read" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Tickets admin read" ON public.support_tickets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications own read" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Notifications own update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.bm_booking_notify() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications(user_id, kind, title, body) VALUES (NEW.client_id, 'booking', 'Horário confirmado', NEW.service_name || ' com ' || NEW.professional_name);
    IF NEW.professional_id IS NOT NULL THEN
      INSERT INTO notifications(user_id, kind, title, body) VALUES (NEW.professional_id, 'booking', 'Novo agendamento', NEW.service_name);
    END IF;
  ELSIF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    IF NEW.payment_status = 'released' AND NEW.professional_id IS NOT NULL THEN
      INSERT INTO notifications(user_id, kind, title, body) VALUES (NEW.professional_id, 'escrow', 'Saldo liberado da custódia', NEW.service_name);
      INSERT INTO notifications(user_id, kind, title, body) VALUES (NEW.client_id, 'escrow', 'Atendimento concluído', NEW.service_name);
    ELSIF NEW.payment_status = 'refunded' THEN
      INSERT INTO notifications(user_id, kind, title, body) VALUES (NEW.client_id, 'escrow', 'Reembolso aprovado', NEW.service_name);
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER bm_booking_notify AFTER INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.bm_booking_notify();

CREATE OR REPLACE FUNCTION public.bm_resolve_ticket(_ticket_id uuid, _reply text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t support_tickets;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF coalesce(trim(_reply), '') = '' THEN RAISE EXCEPTION 'reply required'; END IF;
  UPDATE support_tickets SET status = 'resolved', admin_reply = left(_reply, 500), updated_at = now() WHERE id = _ticket_id AND status = 'open' RETURNING * INTO t;
  IF t.id IS NULL THEN RAISE EXCEPTION 'not found'; END IF;
  INSERT INTO notifications(user_id, kind, title, body) VALUES (t.author_id, 'support', 'Mensagem do suporte BM', left(_reply, 500));
  INSERT INTO admin_actions(admin_id, action, target_id, reason) VALUES (auth.uid(), 'ticket_resolved', _ticket_id, left(_reply, 500));
END $$;
REVOKE ALL ON FUNCTION public.bm_resolve_ticket(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.bm_resolve_ticket(uuid, text) TO authenticated;