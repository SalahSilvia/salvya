-- Phase 7: Creator studio notifications (separate from storefront member alerts)

CREATE TABLE IF NOT EXISTS public.creator_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (
    type IN (
      'order_from_link',
      'link_milestone',
      'campaign_alert',
      'payout_status',
      'fraud_warning',
      'ai_insight'
    )
  ),
  title text NOT NULL,
  body text,
  href text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS creator_notifications_creator_created_idx
  ON public.creator_notifications (creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS creator_notifications_creator_unread_idx
  ON public.creator_notifications (creator_id)
  WHERE read_at IS NULL;

ALTER TABLE public.creator_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY creator_notifications_select_own
  ON public.creator_notifications
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY creator_notifications_update_own
  ON public.creator_notifications
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());
