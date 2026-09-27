import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

// tenant_billing is service-role only (RLS on, no policies) - never use a user client here.
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function getTenantIdForOwner(ownerId: string): Promise<string | null> {
    const { data } = await getSupabaseAdmin()
        .from('tenants')
        .select('id')
        .eq('owner_id', ownerId)
        .maybeSingle();
    return data?.id ?? null;
}

export async function saveTenantBilling(
    tenantId: string,
    ids: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null }
) {
    const row: Record<string, string> = { tenant_id: tenantId };
    if (ids.stripeCustomerId) row.stripe_customer_id = ids.stripeCustomerId;
    if (ids.stripeSubscriptionId) row.stripe_subscription_id = ids.stripeSubscriptionId;

    const { error } = await getSupabaseAdmin()
        .from('tenant_billing')
        .upsert(row, { onConflict: 'tenant_id' });
    if (error) throw error;
}

export async function findTenantIdBySubscription(subscriptionId: string): Promise<string | null> {
    const { data } = await getSupabaseAdmin()
        .from('tenant_billing')
        .select('tenant_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle();
    return data?.tenant_id ?? null;
}

/**
 * Stripe customer for a tenant. Uses the saved ID; for tenants that subscribed
 * before tenant_billing existed, falls back to the subscription's tenantId
 * metadata (set at checkout) and saves what it finds.
 */
export async function getStripeCustomerId(tenantId: string): Promise<string | null> {
    const { data } = await getSupabaseAdmin()
        .from('tenant_billing')
        .select('stripe_customer_id')
        .eq('tenant_id', tenantId)
        .maybeSingle();
    if (data?.stripe_customer_id) return data.stripe_customer_id;

    const result = await stripe.subscriptions.search({
        query: `metadata['tenantId']:'${tenantId}'`,
        limit: 1,
    });
    const subscription = result.data[0];
    if (!subscription) return null;

    const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    await saveTenantBilling(tenantId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
    });
    return customerId;
}
