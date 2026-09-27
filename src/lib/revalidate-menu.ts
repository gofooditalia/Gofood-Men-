import { revalidatePath } from 'next/cache';

const SLUG_RE = /^[a-z0-9-]+$/;

/** Purges the cached public menu pages (ISR) for a tenant slug. */
export function revalidateMenuSlug(slug: string | null | undefined) {
    if (!slug || !SLUG_RE.test(slug)) return;
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/allergeni`);
}
