<!DOCTYPE html>
@php
    $locale  = app()->getLocale();
    $dir     = $locale === 'ar' ? 'rtl' : 'ltr';

    // ── Hreflang paths ─────────────────────────────────────────────────────────
    $segment     = request()->segment(1);
    $pathWithout = in_array($segment, ['en', 'ar'])
        ? '/' . ltrim(preg_replace('#^/(?:en|ar)#', '', request()->getPathInfo()), '/')
        : request()->getPathInfo();

    // ── SEO defaults (Inertia page props override these per-page via JS Head) ──
    // Fetch shared seo props so the HTML source is indexable before JS hydrates.
    $sharedSeo  = [];
    try {
        $sharedSeo = app(\App\Services\SeoMetaService::class)->build();
    } catch (\Throwable) {}

    $metaTitle   = $sharedSeo['title']       ?? config('app.name', 'AiKFS');
    $metaDesc    = $sharedSeo['description'] ?? '';
    $metaKw      = $sharedSeo['keywords']    ?? '';
    $metaRobots  = $sharedSeo['robots']      ?? 'index,follow';
    $canonical   = $sharedSeo['canonical']   ?? request()->url();
    $ogTitle     = $sharedSeo['og']['title']       ?? $metaTitle;
    $ogDesc      = $sharedSeo['og']['description'] ?? $metaDesc;
    $ogImage     = $sharedSeo['og']['image']       ?? '';
    $ogImageAlt  = $sharedSeo['og']['image_alt']   ?? $metaTitle;
    $ogType      = $sharedSeo['og']['type']        ?? 'website';
    $ogSiteName  = $sharedSeo['og']['site_name']   ?? config('app.name', 'AiKFS');
    $ogLocale    = $locale === 'ar' ? 'ar_SA' : 'en_US';
    $twCard      = $sharedSeo['twitter']['card']  ?? 'summary_large_image';
    $twSite      = $sharedSeo['twitter']['site']  ?? '';
    $twImage     = $sharedSeo['twitter']['image'] ?? $ogImage;
    $schema      = $sharedSeo['schema'] ?? null;
@endphp
<html lang="{{ str_replace('_', '-', $locale) }}" dir="{{ $dir }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- ── Primary SEO (SSR fallbacks; Inertia Head overrides per-page) ── --}}
        <title>{{ $metaTitle }}</title>
        @if($metaDesc)
        <meta name="description" content="{{ $metaDesc }}">
        @endif
        @if($metaKw)
        <meta name="keywords" content="{{ $metaKw }}">
        @endif
        <meta name="robots" content="{{ $metaRobots }}">
        <link rel="canonical" href="{{ $canonical }}">

        {{-- ── Hreflang alternates ─────────────────────────────────────────── --}}
        <link rel="alternate" hreflang="en" href="{{ url('/en' . $pathWithout) }}">
        <link rel="alternate" hreflang="ar" href="{{ url('/ar' . $pathWithout) }}">
        <link rel="alternate" hreflang="x-default" href="{{ url('/en' . $pathWithout) }}">

        {{-- ── Open Graph ──────────────────────────────────────────────────── --}}
        <meta property="og:type"        content="{{ $ogType }}">
        <meta property="og:title"       content="{{ $ogTitle }}">
        <meta property="og:description" content="{{ $ogDesc }}">
        <meta property="og:url"         content="{{ $canonical }}">
        <meta property="og:site_name"   content="{{ $ogSiteName }}">
        <meta property="og:locale"      content="{{ $ogLocale }}">
        @if($ogImage)
        <meta property="og:image"       content="{{ $ogImage }}">
        <meta property="og:image:alt"   content="{{ $ogImageAlt }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        @endif

        {{-- ── Twitter Card ────────────────────────────────────────────────── --}}
        <meta name="twitter:card"        content="{{ $twCard }}">
        @if($twSite)
        <meta name="twitter:site"        content="{{ $twSite }}">
        @endif
        <meta name="twitter:title"       content="{{ $ogTitle }}">
        <meta name="twitter:description" content="{{ $ogDesc }}">
        @if($twImage)
        <meta name="twitter:image"       content="{{ $twImage }}">
        <meta name="twitter:image:alt"   content="{{ $ogImageAlt }}">
        @endif

        {{-- ── Schema.org JSON-LD ─────────────────────────────────────────── --}}
        @if($schema)
        <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
        @endif

        @inertiaHead
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    </head>
    <body class="font-sans antialiased {{ $dir === 'rtl' ? 'rtl' : '' }}">
        @inertia
    </body>
</html>
