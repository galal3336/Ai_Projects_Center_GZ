<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Response;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\SitemapIndex;
use Spatie\Sitemap\Tags\Url;

class SitemapController extends Controller
{
    private const LOCALES = ['en', 'ar'];

    /** GET /sitemap.xml — sitemap index pointing to sub-sitemaps */
    public function index(): Response
    {
        $index = SitemapIndex::create();

        foreach (['pages', 'projects'] as $section) {
            $index->add(url("/sitemap-{$section}.xml"));
        }

        return response($index->render(), 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    /** GET /sitemap-pages.xml — static public pages */
    public function pages(): Response
    {
        $sitemap = Sitemap::create();

        $staticRoutes = [
            ['name' => 'home',         'priority' => 1.0,  'freq' => 'daily'],
            ['name' => 'hall-of-fame', 'priority' => 0.9,  'freq' => 'weekly'],
            ['name' => 'projects.index','priority' => 0.9, 'freq' => 'daily'],
            ['name' => 'search',       'priority' => 0.7,  'freq' => 'weekly'],
            ['name' => 'trending',     'priority' => 0.8,  'freq' => 'daily'],
        ];

        foreach ($staticRoutes as $route) {
            foreach (self::LOCALES as $locale) {
                try {
                    $url = Url::create(route($route['name'], ['locale' => $locale]))
                        ->setPriority($route['priority'])
                        ->setChangeFrequency($route['freq']);

                    // Add hreflang alternates
                    foreach (self::LOCALES as $altLocale) {
                        $url->addAlternate(
                            route($route['name'], ['locale' => $altLocale]),
                            $altLocale,
                        );
                    }

                    $sitemap->add($url);
                } catch (\Throwable) {
                    // Route may not exist in this build; skip gracefully
                }
            }
        }

        return response($sitemap->render(), 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    /** GET /sitemap-projects.xml — all published public projects */
    public function projects(): Response
    {
        $sitemap = Sitemap::create();

        Project::query()
            ->where('status', 'published')
            ->where('visibility', 'public')
            ->select(['id', 'slug', 'title', 'title_ar', 'updated_at', 'published_at'])
            ->orderByDesc('published_at')
            ->chunk(200, function ($projects) use ($sitemap) {
                foreach ($projects as $project) {
                    foreach (self::LOCALES as $locale) {
                        $projectUrl = route('projects.show', [
                            'locale' => $locale,
                            'slug'   => $project->slug,
                        ]);

                        $url = Url::create($projectUrl)
                            ->setLastModificationDate($project->updated_at)
                            ->setPriority(0.8)
                            ->setChangeFrequency('monthly');

                        // Hreflang alternates
                        foreach (self::LOCALES as $altLocale) {
                            $url->addAlternate(
                                route('projects.show', ['locale' => $altLocale, 'slug' => $project->slug]),
                                $altLocale,
                            );
                        }

                        $sitemap->add($url);
                    }
                }
            });

        return response($sitemap->render(), 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    /** GET /robots.txt */
    public function robots(): Response
    {
        $appUrl = rtrim(config('app.url'), '/');

        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            '',
            '# Block admin and authenticated-only areas',
            'Disallow: /*/admin/',
            'Disallow: /*/super-admin/',
            'Disallow: /*/student/',
            'Disallow: /*/dashboard',
            'Disallow: /*/notifications',
            'Disallow: /*/me/',
            'Disallow: /*/repositories/',
            'Disallow: /*/recruiter',
            '',
            '# Block API helpers (not useful for crawlers)',
            'Disallow: /*/api/',
            '',
            "Sitemap: {$appUrl}/sitemap.xml",
        ]);

        return response($content, 200, [
            'Content-Type' => 'text/plain',
        ]);
    }
}
