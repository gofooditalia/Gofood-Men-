import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { getStripeCustomerId, getTenantIdForOwner } from '@/lib/stripe-billing';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { returnUrl } = body;

        // 1. Resolve the tenant's saved Stripe customer
        const tenantId = await getTenantIdForOwner(user.id);
        if (!tenantId) {
            return new NextResponse('Tenant not found', { status: 404 });
        }

        const customerId = await getStripeCustomerId(tenantId);
        if (!customerId) {
            return new NextResponse('No Stripe customer found', { status: 404 });
        }

        // 2. Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || req.headers.get('origin') + '/dashboard/account',
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('[STRIPE_PORTAL] Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
