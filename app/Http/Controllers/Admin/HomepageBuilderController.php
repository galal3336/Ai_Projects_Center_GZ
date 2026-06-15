<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageVersion;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomepageBuilderController extends Controller
{
    // ─── Default section schema ───────────────────────────────────────────────

    private const DEFAULT_SECTIONS = [
        [
            'id'      => 'hero',
            'type'    => 'hero',
            'label'   => 'Hero Banner',
            'enabled' => true,
            'order'   => 0,
            'config'  => [
                'headline'    => 'Showcase Your Innovation',
                'subheadline' => 'Browse student projects from King Faisal University',
                'cta_text'    => 'Explore Projects',
                'cta_url'     => '/projects',
            ],
        ],
        [
            'id'      => 'statistics',
            'type'    => 'statistics',
            'label'   => 'Platform Statistics',
            'enabled' => true,
            'order'   => 1,
            'config'  => [],
        ],
        [
            'id'      => 'featured_projects',
            'type'    => 'featured_projects',
            'label'   => 'Featured Projects',
            'enabled' => true,
            'order'   => 2,
            'config'  => [
                'title' => 'Featured Projects',
                'limit' => 6,
            ],
        ],
        [
            'id'      => 'winning_projects',
            'type'    => 'winning_projects',
            'label'   => 'Winning Projects',
            'enabled' => true,
            'order'   => 3,
            'config'  => [
                'title' => 'Award-Winning Projects',
                'limit' => 3,
            ],
        ],
        [
            'id'      => 'sponsors',
            'type'    => 'sponsors',
            'label'   => 'Sponsors',
            'enabled' => false,
            'order'   => 4,
            'config'  => [
                'title'   => 'Our Sponsors',
                'logos'   => [],
            ],
        ],
        [
            'id'      => 'partners',
            'type'    => 'partners',
            'label'   => 'Partners',
            'enabled' => false,
            'order'   => 5,
            'config'  => [
                'title'   => 'Our Partners',
                'logos'   => [],
            ],
        ],
        [
            'id'      => 'footer',
            'type'    => 'footer',
            'label'   => 'Footer',
            'enabled' => true,
            'order'   => 6,
            'config'  => [
                'tagline'       => 'AI Projects Showcase — King Faisal University',
                'show_socials'  => true,
                'show_links'    => true,
            ],
        ],
    ];

    // ─── Show builder page ────────────────────────────────────────────────────

    public function index(): Response
    {
        $raw = SiteSetting::get('homepage_draft');
        $draft = $raw ? (is_array($raw) ? $raw : json_decode($raw, true)) : self::DEFAULT_SECTIONS;

        $versions = HomepageVersion::with('creator:id,name')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($v) => [
                'id'           => $v->id,
                'label'        => $v->label,
                'is_published' => $v->is_published,
                'created_by'   => $v->creator?->name ?? 'System',
                'created_at'   => $v->created_at->toISOString(),
            ]);

        $published = HomepageVersion::where('is_published', true)
            ->orderByDesc('created_at')
            ->value('id');

        return Inertia::render('Admin/HomepageBuilder/Index', [
            'draft'            => $draft,
            'versions'         => $versions,
            'published_version_id' => $published,
        ]);
    }

    // ─── Save draft ───────────────────────────────────────────────────────────

    public function saveDraft(Request $request)
    {
        $request->validate([
            'sections'          => 'required|array',
            'sections.*.id'     => 'required|string',
            'sections.*.type'   => 'required|string',
            'sections.*.enabled'=> 'required|boolean',
            'sections.*.order'  => 'required|integer',
        ]);

        $sections = $request->input('sections');

        SiteSetting::updateOrCreate(
            ['group' => 'homepage', 'key' => 'homepage_draft'],
            [
                'value'      => json_encode($sections),
                'type'       => 'json',
                'label'      => 'Homepage Builder Draft',
                'is_public'  => false,
                'updated_by' => $request->user()->id,
            ]
        );

        Cache::forget('site_setting:homepage_draft');

        return response()->json(['message' => 'Draft saved.']);
    }

    // ─── Publish ──────────────────────────────────────────────────────────────

    public function publish(Request $request)
    {
        $request->validate([
            'sections'          => 'required|array',
            'sections.*.id'     => 'required|string',
            'sections.*.type'   => 'required|string',
            'sections.*.enabled'=> 'required|boolean',
            'sections.*.order'  => 'required|integer',
            'label'             => 'nullable|string|max:120',
        ]);

        $sections = $request->input('sections');
        $label    = $request->input('label') ?? 'Published ' . now()->format('d M Y H:i');

        // Save draft
        SiteSetting::updateOrCreate(
            ['group' => 'homepage', 'key' => 'homepage_draft'],
            [
                'value'      => json_encode($sections),
                'type'       => 'json',
                'label'      => 'Homepage Builder Draft',
                'is_public'  => false,
                'updated_by' => $request->user()->id,
            ]
        );
        Cache::forget('site_setting:homepage_draft');

        // Write published layout
        SiteSetting::updateOrCreate(
            ['group' => 'homepage', 'key' => 'homepage_layout'],
            [
                'value'      => json_encode($sections),
                'type'       => 'json',
                'label'      => 'Homepage Layout (Published)',
                'is_public'  => true,
                'updated_by' => $request->user()->id,
            ]
        );
        Cache::forget('site_setting:homepage_layout');
        Cache::forget('site_settings_group:homepage');

        // Snapshot version history (cap at 50)
        $version = HomepageVersion::create([
            'sections'     => $sections,
            'label'        => $label,
            'is_published' => true,
            'created_by'   => $request->user()->id,
        ]);

        // Mark only this version as published
        HomepageVersion::where('id', '!=', $version->id)
            ->update(['is_published' => false]);

        // Prune old versions beyond 50
        $ids = HomepageVersion::orderByDesc('created_at')->skip(50)->pluck('id');
        if ($ids->isNotEmpty()) {
            HomepageVersion::whereIn('id', $ids)->delete();
        }

        return response()->json([
            'message' => 'Homepage published.',
            'version' => [
                'id'           => $version->id,
                'label'        => $version->label,
                'is_published' => $version->is_published,
                'created_by'   => $request->user()->name,
                'created_at'   => $version->created_at->toISOString(),
            ],
        ]);
    }

    // ─── Restore a version ────────────────────────────────────────────────────

    public function restore(Request $request, HomepageVersion $version)
    {
        SiteSetting::updateOrCreate(
            ['group' => 'homepage', 'key' => 'homepage_draft'],
            [
                'value'      => json_encode($version->sections),
                'type'       => 'json',
                'label'      => 'Homepage Builder Draft',
                'is_public'  => false,
                'updated_by' => $request->user()->id,
            ]
        );
        Cache::forget('site_setting:homepage_draft');

        return response()->json([
            'message'  => 'Version restored to draft.',
            'sections' => $version->sections,
        ]);
    }

    // ─── Delete a version ─────────────────────────────────────────────────────

    public function destroyVersion(HomepageVersion $version)
    {
        if ($version->is_published) {
            return response()->json(['message' => 'Cannot delete the currently published version.'], 422);
        }

        $version->delete();

        return response()->json(['message' => 'Version deleted.']);
    }
}
