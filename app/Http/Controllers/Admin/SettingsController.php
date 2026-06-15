<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Security\AuditLogService;
use App\Services\Security\FileUploadSecurityService;
use App\Services\Settings\SiteSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(
        private readonly SiteSettingService $settings,
        private readonly FileUploadSecurityService $uploadSecurity,
        private readonly AuditLogService $audit,
    ) {}

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

        $file = $request->file('file');

        try {
            $this->uploadSecurity->validateBrandingAsset($file, 2048);
        } catch (\InvalidArgumentException $e) {
            $this->audit->fileUploadRejected($file->getClientOriginalName(), $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $url = $this->settings->storeAsset(
            file:      $file,
            key:       $request->input('key'),
            group:     'branding',
            isPublic:  true,
            updatedBy: $request->user()->id,
        );

        $this->audit->fileUploaded('branding_asset', $file->getClientOriginalName());

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
                'google_analytics'   => ['nullable', 'string', 'regex:/^G-[A-Z0-9]{4,20}$/'],
                'google_tag_manager' => ['nullable', 'string', 'regex:/^GTM-[A-Z0-9]{4,10}$/'],
            ],
            'contact' => [
                'contact_email'      => ['nullable', 'email', 'max:255'],
                'support_email'      => ['nullable', 'email', 'max:255'],
                'contact_phone'      => ['nullable', 'string', 'max:30'],
                'contact_address'    => ['nullable', 'string', 'max:500'],
                'contact_city'       => ['nullable', 'string', 'max:100'],
                'contact_country'    => ['nullable', 'string', 'max:100'],
                'maps_embed_url'     => ['nullable', 'url', 'max:2048', 'regex:/^https:\/\//i'],
            ],
            'social' => [
                'social_twitter'     => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//i'],
                'social_linkedin'    => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//i'],
                'social_github'      => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//i'],
                'social_instagram'   => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//i'],
                'social_youtube'     => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//i'],
                'social_facebook'    => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//i'],
            ],
            'footer' => [
                'footer_tagline'        => ['nullable', 'string', 'max:255'],
                'footer_copyright'      => ['nullable', 'string', 'max:255'],
                'footer_show_socials'   => ['boolean'],
                'footer_show_links'     => ['boolean'],
                'footer_links'          => ['nullable', 'array', 'max:20'],
                'footer_links.*.label'  => ['required_with:footer_links', 'string', 'max:60'],
                'footer_links.*.url'    => ['required_with:footer_links', 'url', 'max:255', 'regex:/^https?:\/\//i'],
                'footer_links.*.target' => ['nullable', 'string', 'in:_self,_blank'],
            ],
            default => [],
        };
    }
}
