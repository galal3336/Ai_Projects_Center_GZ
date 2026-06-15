import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SeoMeta {
    title: string;
    site_name?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    robots?: string;
    locale?: string;
    og?: {
        title?: string;
        description?: string;
        image?: string;
        image_alt?: string;
        url?: string;
        type?: string;
        site_name?: string;
        locale?: string;
    };
    twitter?: {
        card?: string;
        site?: string;
        title?: string;
        description?: string;
        image?: string;
        image_alt?: string;
    };
    schema?: Record<string, unknown> | null;
}

interface Props {
    seo: SeoMeta;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SEOHead({ seo }: Props) {
    const { props } = usePage<{ locale: string }>();
    const locale = seo.locale ?? props.locale ?? 'en';
    const fullTitle = seo.site_name && !seo.title.includes(seo.site_name)
        ? `${seo.title} — ${seo.site_name}`
        : seo.title;

    return (
        <Head title={seo.title}>
            {/* ── Primary ──────────────────────────────────────────────── */}
            {seo.description && (
                <meta head-key="description" name="description" content={seo.description} />
            )}
            {seo.keywords && (
                <meta head-key="keywords" name="keywords" content={seo.keywords} />
            )}
            {seo.robots && (
                <meta head-key="robots" name="robots" content={seo.robots} />
            )}
            {seo.canonical && (
                <link head-key="canonical" rel="canonical" href={seo.canonical} />
            )}

            {/* ── Open Graph ───────────────────────────────────────────── */}
            <meta head-key="og:type" property="og:type" content={seo.og?.type ?? 'website'} />
            <meta head-key="og:title" property="og:title" content={seo.og?.title ?? fullTitle} />
            {(seo.og?.description ?? seo.description) && (
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={seo.og?.description ?? seo.description!}
                />
            )}
            {(seo.og?.url ?? seo.canonical) && (
                <meta
                    head-key="og:url"
                    property="og:url"
                    content={seo.og?.url ?? seo.canonical!}
                />
            )}
            {seo.og?.site_name && (
                <meta head-key="og:site_name" property="og:site_name" content={seo.og.site_name} />
            )}
            {seo.og?.image && (
                <>
                    <meta head-key="og:image" property="og:image" content={seo.og.image} />
                    {seo.og.image_alt && (
                        <meta head-key="og:image:alt" property="og:image:alt" content={seo.og.image_alt} />
                    )}
                    <meta head-key="og:image:width" property="og:image:width" content="1200" />
                    <meta head-key="og:image:height" property="og:image:height" content="630" />
                </>
            )}
            <meta
                head-key="og:locale"
                property="og:locale"
                content={seo.og?.locale ?? (locale === 'ar' ? 'ar_SA' : 'en_US')}
            />

            {/* ── Twitter Card ─────────────────────────────────────────── */}
            <meta head-key="twitter:card" name="twitter:card" content={seo.twitter?.card ?? 'summary_large_image'} />
            {seo.twitter?.site && (
                <meta head-key="twitter:site" name="twitter:site" content={seo.twitter.site} />
            )}
            <meta head-key="twitter:title" name="twitter:title" content={seo.twitter?.title ?? fullTitle} />
            {(seo.twitter?.description ?? seo.description) && (
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={seo.twitter?.description ?? seo.description!}
                />
            )}
            {seo.twitter?.image && (
                <>
                    <meta head-key="twitter:image" name="twitter:image" content={seo.twitter.image} />
                    {seo.twitter.image_alt && (
                        <meta head-key="twitter:image:alt" name="twitter:image:alt" content={seo.twitter.image_alt} />
                    )}
                </>
            )}

            {/* ── Schema.org JSON-LD ───────────────────────────────────── */}
            {seo.schema && (
                <script
                    head-key="schema-jsonld"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.schema) }}
                />
            )}
        </Head>
    );
}
