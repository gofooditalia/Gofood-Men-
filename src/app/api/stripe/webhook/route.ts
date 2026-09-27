import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { findTenantIdBySubscription, isCurrentSubscription, saveTenantBilling } from '@/lib/stripe-billing';
import { revalidateMenuSlug } from '@/lib/revalidate-menu';

// Stripe subscription statuses -> values allowed by tenants_subscription_status_check
const SUBSCRIPTION_STATUS_MAP: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    unpaid: 'past_due',
    incomplete: 'incomplete',
    incomplete_expired: 'cancelled',
    canceled: 'cancelled',
    paused: 'suspended',
};

// Initialize Supabase with Service Role Key to bypass RLS
const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('Stripe-Signature') as string;

    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is missing');
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error(`[STRIPE_WEBHOOK] Signature error: ${error}`);
        return new NextResponse('Webhook Error', { status: 400 });
    }

    const session = event.data.object as any;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                // Retrieve the session to get metadata (it should be in the event, but safer to trust the event object)
                // Check if it's a subscription mode
                if (session.mode === 'subscription') {
                    const tenantId = session.metadata?.tenantId;
                    const desiredSlug = session.metadata?.desiredSlug;
                    const stripeSubscriptionId = session.subscription;
                    const stripeCustomerId = session.customer;

                    if (!tenantId) {
                        console.error('[STRIPE_WEBHOOK] Missing tenantId in metadata');
                        break;
                    }

                    console.log(`[STRIPE_WEBHOOK] Activating tenant ${tenantId}`);

                    const updateData: any = {
                        subscription_status: 'active',
                        subscription_tier: 'premium',
                    };

                    console.log(`[STRIPE_WEBHOOK] Processing subscription for tenant ${tenantId}`);
                    console.log(`[STRIPE_WEBHOOK] Metadata desiredSlug: "${desiredSlug}"`);

                    // If a new slug was requested and paid for, update it.
                    if (desiredSlug) {
                        updateData.slug = desiredSlug;
                        console.log(`[STRIPE_WEBHOOK] Will update slug to: ${desiredSlug}`);
                    } else {
                        console.warn('[STRIPE_WEBHOOK] No desiredSlug in metadata, skipping slug update');
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error } = await (supabaseAdmin.from('tenants') as any)
                        .update(updateData)
                        .eq('id', tenantId);

                    if (error) {
                        console.error('[STRIPE_WEBHOOK] DB Error:', error);
                        throw error;
                    }

                    await saveTenantBilling(tenantId, {
                        stripeCustomerId,
                        stripeSubscriptionId,
                    });
                    await revalidateTenantMenu(tenantId);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                // Subscription cancelled/deleted
                const subscription = event.data.object;
                const tenantId = subscription.metadata?.tenantId
                    ?? await findTenantIdBySubscription(subscription.id);

                if (tenantId && !(await isCurrentSubscription(tenantId, subscription.id))) {
                    console.log(`[STRIPE_WEBHOOK] Ignoring deletion of stale subscription ${subscription.id} for tenant ${tenantId}`);
                } else if (tenantId) {
                    console.log(`[STRIPE_WEBHOOK] Deactivating tenant ${tenantId}`);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error } = await (supabaseAdmin.from('tenants') as any)
                        .update({
                            subscription_status: 'active', // Fallback to 'active' for free tier to satisfy DB constraint
                            subscription_tier: 'free'
                        })
                        .eq('id', tenantId);

                    if (error) {
                        console.error('[STRIPE_WEBHOOK] DB Error (deleted):', error);
                        throw error;
                    }
                    console.log(`[STRIPE_WEBHOOK] Successfully deactivated tenant ${tenantId}`);
                    await revalidateTenantMenu(tenantId);
                } else {
                    console.warn('[STRIPE_WEBHOOK] No tenant found for deleted subscription', subscription.id);
                }
                break;
            }

            case 'customer.subscription.updated': {
                // Handle renewal issues, past_due, etc.
                const subscription = event.data.object;
                const tenantId = subscription.metadata?.tenantId
                    ?? await findTenantIdBySubscription(subscription.id);
                const status = SUBSCRIPTION_STATUS_MAP[subscription.status];

                if (tenantId && !(await isCurrentSubscription(tenantId, subscription.id))) {
                    console.log(`[STRIPE_WEBHOOK] Ignoring update of stale subscription ${subscription.id} for tenant ${tenantId}`);
                } else if (tenantId && status) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error } = await (supabaseAdmin.from('tenants') as any)
                        .update({
                            subscription_status: status
                        })
                        .eq('id', tenantId);

                    if (error) {
                        console.error('[STRIPE_WEBHOOK] DB Error (updated):', error);
                        throw error;
                    }
                    await revalidateTenantMenu(tenantId);
                } else if (!status) {
                    console.warn(`[STRIPE_WEBHOOK] Unmapped subscription status: ${subscription.status}`);
                }
                break;
            }
        }
    } catch (error) {
        console.error('[STRIPE_WEBHOOK] Processing error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }

    return new NextResponse('Received', { status: 200 });
}

// Subscription changes decide whether the public menu is served (free tier = 404).
async function revalidateTenantMenu(tenantId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabaseAdmin.from('tenants') as any)
        .select('slug')
        .eq('id', tenantId)
        .maybeSingle();
    revalidateMenuSlug(data?.slug);
}
