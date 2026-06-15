<?php

namespace App\Services;

use App\Models\Project;
use App\Services\Settings\SiteSettingService;
use Illuminate\Support\Str;

class SeoMetaService
{
    public function __construct(protected SiteSettingService $settings) {}

    /** Build SEO meta array for any page. $overrides win over site defaults. */
    public function build(array $overrides = []): array
    {
        $locale   = app()->getLocale();
        $site     = $this->settings->group('seo');
        $general  = $this->settings->group('general');
        $branding = $this->settings->group('branding');

        $siteName = $general['site_name']        ?? config('app.name', 'AiKFS');
        $siteDesc = $general['site_description'] ?? ($site['meta_description'] ?? '');
        $ogImage  = $site['og_image_url']        ?? ($branding['site_logo'] ?? '');
        $baseUrl  = config('app.url');

        $title       = $overrides['title']       ?? $site['meta_title']       ?? $siteName;
        $description = $overrides['description'] ?? $site['meta_description'] ?? $siteDesc;
        $keywords    = $overrides['keywords']    ?? $site['meta_keywords']    ?? '';
        $canonical   = $overrides['canonical']   ?? request()->url();
        $robots      = $overrides['robots']      ?? $site['robots']           ?? 'index,follow';
        $image       = $overrides['image']       ?? $ogImage;
        $imageAlt    = $overrides['image_alt']   ?? $title;
        $type        = $overrides['type']        ?? 'website';

        $ogTitle       = $overrides['og_title']       ?? $site['og_title']       ?? $title;
        $ogDescription = $overrides['og_description'] ?? $site['og_description'] ?? $description;

        $twitterCard = $overrides['twitter_card'] ?? $site['twitter_card'] ?? 'summary_large_image';
        $twitterSite = $overrides['twitter_site'] ?? $site['twitter_site'] ?? '';

        // Absolute image URL
        if ($image && !Str::startsWith($image, ['http://', 'https://'])) {
            $image = rtrim($baseUrl, '/') . '/' . ltrim($image, '/');
        }

        return [
            'title'           => $title,
            'site_name'       => $siteName,
            'description'     => $description,
            'keywords'        => $keywords,
            'canonical'       => $canonical,
            'robots'          => $robots,
            'locale'          => $locale,

            'og' => [
                'title'       => $ogTitle,
                'description' => $ogDescription,
                'image'       => $image,
                'image_alt'   => $imageAlt,
                'url'         => $canonical,
                'type'        => $type,
                'site_name'   => $siteName,
                'locale'      => $locale === 'ar' ? 'ar_SA' : 'en_US',
            ],

            'twitter' => [
                'card'        => $twitterCard,
                'site'        => $twitterSite,
                'title'       => $ogTitle,
                'description' => $ogDescription,
                'image'       => $image,
                'image_alt'   => $imageAlt,
            ],

            'schema' => $overrides['schema'] ?? null,
        ];
    }

    /** Build SEO meta for a Project detail page */
    public function forProject(Project $project): array
    {
        $locale    = app()->getLocale();
        $title     = $project->seo_title
            ?? ($locale === 'ar' ? ($project->title_ar ?? $project->title) : $project->title);
        $desc      = $project->seo_description
            ?? ($locale === 'ar' ? ($project->abstract_ar ?? $project->abstract) : $project->abstract);
        $keywords  = $project->seo_keywords
            ? implode(', ', $project->seo_keywords)
            : implode(', ', $project->tags ?? []);

        $canonical = route('projects.show', [
            'locale' => $locale,
            'slug'   => $project->slug,
        ]);

        $thumbnail = $project->thumbnail;
        if ($thumbnail && !str_starts_with($thumbnail, 'http')) {
            $thumbnail = rtrim(config('app.url'), '/') . '/' . ltrim($thumbnail, '/');
        }

        $schema = $this->projectSchema($project, $title, $desc, $canonical, $thumbnail);

        return $this->build([
            'title'       => $title,
            'description' => $desc,
            'keywords'    => $keywords,
            'canonical'   => $canonical,
            'image'       => $thumbnail,
            'image_alt'   => $title,
            'type'        => 'article',
            'schema'      => $schema,
        ]);
    }

    /** Build SEO meta for Hall of Fame page */
    public function forHallOfFame(): array
    {
        $locale = app()->getLocale();
        $title  = $locale === 'ar'
            ? 'قاعة الشهرة — أفضل المشاريع الطلابية'
            : 'Hall of Fame — Top Student Projects';
        $desc   = $locale === 'ar'
            ? 'اكتشف أفضل المشاريع الطلابية والطلاب المتميزين والجوائز في قاعة الشهرة.'
            : 'Discover the best student AI projects, top-ranked students, and award-winning work.';

        $schema = [
            '@context' => 'https://schema.org',
            '@type'    => 'CollectionPage',
            'name'     => $title,
            'description' => $desc,
            'url'      => route('hall-of-fame', ['locale' => $locale]),
        ];

        return $this->build([
            'title'       => $title,
            'description' => $desc,
            'type'        => 'website',
            'schema'      => $schema,
        ]);
    }

    /** Build SEO meta for Projects listing page */
    public function forProjectsIndex(?string $categoryName = null): array
    {
        $locale = app()->getLocale();
        $base   = $locale === 'ar' ? 'استكشف مشاريع الذكاء الاصطناعي الطلابية' : 'Browse Student AI Projects';
        $title  = $categoryName ? "{$categoryName} — {$base}" : $base;
        $desc   = $locale === 'ar'
            ? 'تصفح مئات المشاريع الطلابية في الذكاء الاصطناعي والتعلم الآلي ورؤية الحاسوب وأكثر.'
            : 'Browse hundreds of student projects in AI, machine learning, computer vision, and more.';

        $schema = [
            '@context' => 'https://schema.org',
            '@type'    => 'CollectionPage',
            'name'     => $title,
            'description' => $desc,
            'url'      => route('projects.index', ['locale' => $locale]),
        ];

        return $this->build([
            'title'       => $title,
            'description' => $desc,
            'schema'      => $schema,
        ]);
    }

    // ─── Schema builders ──────────────────────────────────────────────────────

    private function projectSchema(
        Project $project,
        string $title,
        ?string $desc,
        string $url,
        ?string $image,
    ): array {
        $schema = [
            '@context'    => 'https://schema.org',
            '@type'       => 'SoftwareSourceCode',
            'name'        => $title,
            'description' => $desc ?? '',
            'url'         => $url,
            'datePublished' => $project->published_at?->toIso8601String()
                            ?? $project->created_at->toIso8601String(),
            'dateModified'  => $project->updated_at->toIso8601String(),
            'keywords'      => implode(', ', $project->tags ?? []),
        ];

        if ($image) {
            $schema['image'] = $image;
        }

        if ($project->relationLoaded('owner') && $project->owner) {
            $schema['author'] = [
                '@type' => 'Person',
                'name'  => $project->owner->name,
            ];
        }

        if ($project->relationLoaded('category') && $project->category) {
            $schema['genre'] = $project->category->name;
        }

        if ($project->relationLoaded('technologies') && $project->technologies->isNotEmpty()) {
            $schema['programmingLanguage'] = $project->technologies
                ->pluck('name')
                ->implode(', ');
        }

        if ($project->relationLoaded('awards') && $project->awards->isNotEmpty()) {
            $schema['award'] = $project->awards
                ->map(fn ($a) => $a->title)
                ->implode(', ');
        }

        if ($project->views_count > 0) {
            $schema['interactionStatistic'] = [
                '@type'                => 'InteractionCounter',
                'interactionType'      => 'https://schema.org/ViewAction',
                'userInteractionCount' => $project->views_count,
            ];
        }

        // BreadcrumbList
        $locale = app()->getLocale();
        $schema['breadcrumb'] = [
            '@type'           => 'BreadcrumbList',
            'itemListElement' => [
                [
                    '@type'    => 'ListItem',
                    'position' => 1,
                    'name'     => 'Home',
                    'item'     => route('home', ['locale' => $locale]),
                ],
                [
                    '@type'    => 'ListItem',
                    'position' => 2,
                    'name'     => 'Projects',
                    'item'     => route('projects.index', ['locale' => $locale]),
                ],
                [
                    '@type'    => 'ListItem',
                    'position' => 3,
                    'name'     => $title,
                    'item'     => $url,
                ],
            ],
        ];

        return $schema;
    }
}
