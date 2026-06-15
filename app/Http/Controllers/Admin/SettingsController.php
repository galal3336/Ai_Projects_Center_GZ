<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Settings\SiteSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(private readonly SiteSettingService $settings) {}

    // ─── Page ─────────────────────────────────────────────────────────────────

    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => $this->allGroups(),
        ]);
    }

    // ─── Save a group (JSON body) ─────────────────────────────────────────────

    public function saveGroup(Request $request, string $group): JsonResponse
    {
        $allowed = ['general', 'branding', 'seo', 'contact', 'social', 'footer'];

        if (! in_array($group, $allowed)) {
            return response()->json(['message' => 'Unknown settings group.'], 422);
        }

        $data = $request->validate($this->groupRules($group));

        $this->settings->saveGroup($group, $data, $request->user()->id);

        return response()->json([
            'message'  => 'Settings saved.',
            'settings' => $this->allGroups(),
        ]);
    }

    // ─── Upload a file asset (logo / favicon) ─────────────────────────────────

    public function uploadAsset(Request $request): JsonResponse
    {
        $request->validate([
            'key'  => ['required', 'string', 'in:site_logo,site_favicon'],
            'file' => ['required', 'file', 'mimes:png,jpg,jpeg,gif,svg,ico,webp', 'max:2048'],
        ]);

        $url = $this->settings->storeAsset(
            file:      $request->file('file'),
            key:       $request->input('key'),
            group:     'branding',
            isPublic:  true,
            updatedBy: $request->user()->id,
        );

        return response()->json([
            'message'  => 'Asset uploaded.',
            'url'      => $url,
            'settings' => $this->allGroups(),
        ]);
    }

    // ─── Flush all settings cache ─────────────────────────────────────────────

    public function flushCache(): JsonResponse
    {
        $this->settings->bustAll();

        return response()->json(['message' => 'Settings cache cleared.']);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function allGroups(): array
    {
        return [
            'general' => $this->settings->group('general'),
            'branding' => $this->settings->group('branding'),
            'seo'     => $this->settings->group('seo'),
            'contact' => $this->settings->group('contact'),
            'social'  => $this->settings->group('social'),
            'footer'  => $this->settings->group('footer'),
        ];
    }

    private function groupRules(string $group): array
    {
        return match ($group) {
            'general' => [
                'site_name'          => ['required', 'string', 'max:120'],
                'site_tagline'       => ['nullable', 'string', 'max:255'],
                'site_description'   => ['nullable', 'string', 'max:500'],
                'maintenance_mode'   => ['boolean'],
                'registration_open'  => ['boolean'],
                'guest_view'         => ['boolean'],
                'require_approval'   => ['boolean'],
                'session_timeout'    => ['integer', 'min:5', 'max:1440'],
                'max_upload_mb'      => ['integer', 'min:1', 'max:500'],
            ],
            'branding' => [
                'primary_color'      => ['nullable', 'string', 'max:20'],
                'accent_color'       => ['nullable', 'string', 'max:20'],
            ],
            'seo' => [
                'meta_title'         => ['nullable', 'string', 'max:120'],
                'meta_description'   => ['nullable', 'string', 'max:500'],
                'meta_keywords'      => ['nullable', 'string', 'max:500'],
                'og_title'           => ['nullable', 'string', 'max:120'],
                'og_description'     => ['nullable', 'string', 'max:300'],
                'og_image_url'       => ['nullable', 'url', 'max:2048'],
                'twitter_card'       => ['nullable', 'string', 'in:summary,summary_large_image'],
                'twitter_site'       => ['nullable', 'string', 'max:50'],
                'canonical_url'      => ['nullable', 'url', 'max:2048'],
                'robots'             => ['nullable', 'string', 'max:100'],
                'google_analytics'   => ['nullable', 'string', 'max:30'],
                'google_tag_manager' => ['nullable', 'string', 'max:30'],
            ],
            'contact' => [
                'contact_email'      => ['nullable', 'email', 'max:255'],
                'support_email'      => ['nullable', 'email', 'max:255'],
                'contact_phone'      => ['nullable', 'string', 'max:30'],
                'contact_address'    => ['nullable', 'string', 'max:500'],
                'contact_city'       => ['nullable', 'string', 'max:100'],
                'contact_country'    => ['nullable', 'string', 'max:100'],
                'maps_embed_url'     => ['nullable', 'string', 'max:2048'],
            ],
            'social' => [
                'social_twitter'     => ['nullable', 'url', 'max:255'],
                'social_linkedin'    => ['nullable', 'url', 'max:255'],
                'social_github'      => ['nullable', 'url', 'max:255'],
                'social_instagram'   => ['nullable', 'url', 'max:255'],
                'social_youtube'     => ['nullable', 'url', 'max:255'],
                'social_facebook'    => ['nullable', 'url', 'max:255'],
            ],
            'footer' => [
                'footer_tagline'        => ['nullable', 'string', 'max:255'],
                'footer_copyright'      => ['nullable', 'string', 'max:255'],
                'footer_show_socials'   => ['boolean'],
                'footer_show_links'     => ['boolean'],
                'footer_links'          => ['nullable', 'array'],
                'footer_links.*.label'  => ['required_with:footer_links', 'string', 'max:60'],
                'footer_links.*.url'    => ['required_with:footer_links', 'string', 'max:255'],
                'footer_links.*.target' => ['nullable', 'string', 'in:_self,_blank'],
            ],
            default => [],
        };
    }
}
