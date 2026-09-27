-- 036: Stripe billing IDs + server-only subscription fields
--
-- 1. tenant_billing stores Stripe customer/subscription IDs per tenant.
--    RLS enabled with NO policies: only the service role (webhook, API routes)
--    can read/write it. Kept off `tenants` because that table is publicly
--    readable and owner-updatable, which would let a user point their tenant
--    at another customer's billing portal.
--
-- 2. subscription_tier / subscription_status on tenants can no longer be set
--    by anon/authenticated clients. Previously any owner could self-upgrade to
--    premium with a plain supabase-js update.

CREATE TABLE IF NOT EXISTS public.tenant_billing (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tenant_billing IS 'Stripe IDs per tenant - service role only (RLS on, no policies)';

CREATE INDEX IF NOT EXISTS idx_tenant_billing_stripe_customer_id
  ON public.tenant_billing (stripe_customer_id);

ALTER TABLE public.tenant_billing ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tenant_billing FROM anon, authenticated;

DROP TRIGGER IF EXISTS update_tenant_billing_updated_at ON public.tenant_billing;
CREATE TRIGGER update_tenant_billing_updated_at
  BEFORE UPDATE ON public.tenant_billing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.protect_tenant_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Only client roles are restricted; service_role / postgres pass through.
  IF current_user IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.subscription_tier := 'free';
      NEW.subscription_status := 'active';
    ELSIF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier
       OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
      RAISE EXCEPTION 'subscription fields can only be changed by the billing system'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_tenant_subscription_fields ON public.tenants;
CREATE TRIGGER protect_tenant_subscription_fields
  BEFORE INSERT OR UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.protect_tenant_subscription_fields();
