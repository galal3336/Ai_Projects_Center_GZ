<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            // ── General ──────────────────────────────────────────────────────
            ['general', 'site_name',         'AiKFS',                               'string',  'Site Name',         true,  0],
            ['general', 'site_tagline',       'Student Project Showcase — KFU',      'string',  'Tagline',           true,  1],
            ['general', 'site_description',   'Browse AI and technology projects from King Faisal University students.', 'text', 'Site Description', true, 2],
            ['general', 'maintenance_mode',   '0',                                   'boolean', 'Maintenance Mode',  false, 3],
            ['general', 'registration_open',  '1',                                   'boolean', 'Registration Open', false, 4],
            ['general', 'guest_view',         '1',                                   'boolean', 'Guest View',        false, 5],
            ['general', 'require_approval',   '1',                                   'boolean', 'Require Approval',  false, 6],
            ['general', 'session_timeout',    '60',                                  'integer', 'Session Timeout',   false, 7],
            ['general', 'max_upload_mb',      '50',                                  'integer', 'Max Upload MB',     false, 8],

            // ── Branding ─────────────────────────────────────────────────────
            ['branding', 'site_logo',         '',                                    'string',  'Site Logo URL',     true,  0],
            ['branding', 'site_favicon',      '',                                    'string',  'Favicon URL',       true,  1],
            ['branding', 'primary_color',     '#22C55E',                             'string',  'Primary Color',     true,  2],
            ['branding', 'accent_color',      '#6366f1',                             'string',  'Accent Color',      true,  3],

            // ── SEO ──────────────────────────────────────────────────────────
            ['seo', 'meta_title',             'AiKFS — Student AI Project Showcase', 'string',  'Meta Title',        true,  0],
            ['seo', 'meta_description',       'Discover innovative AI student projects from King Faisal University.', 'text', 'Meta Description', true, 1],
            ['seo', 'meta_keywords',          'AI, machine learning, student projects, KFU, Saudi Arabia', 'string', 'Meta Keywords', false, 2],
            ['seo', 'og_title',               'AiKFS — Student AI Projects',         'string',  'OG Title',          false, 3],
            ['seo', 'og_description',         'Explore student-built AI solutions from King Faisal University.', 'text', 'OG Description', false, 4],
            ['seo', 'og_image_url',           '',                                    'string',  'OG Image URL',      false, 5],
            ['seo', 'twitter_card',           'summary_large_image',                 'string',  'Twitter Card',      false, 6],
            ['seo', 'twitter_site',           '',                                    'string',  'Twitter @handle',   false, 7],
            ['seo', 'canonical_url',          '',                                    'string',  'Canonical URL',     false, 8],
            ['seo', 'robots',                 'index, follow',                       'string',  'Robots Directive',  false, 9],
            ['seo', 'google_analytics',       '',                                    'string',  'GA Measurement ID', false, 10],
            ['seo', 'google_tag_manager',     '',                                    'string',  'GTM Container ID',  false, 11],

            // ── Contact ──────────────────────────────────────────────────────
            ['contact', 'contact_email',      'info@aikfs.edu.sa',                   'string',  'Contact Email',     true,  0],
            ['contact', 'support_email',      'support@aikfs.edu.sa',                'string',  'Support Email',     true,  1],
            ['contact', 'contact_phone',      '+966 1 380 0000',                     'string',  'Phone',             true,  2],
            ['contact', 'contact_address',    'King Faisal University, Al-Ahsa',     'string',  'Address',           true,  3],
            ['contact', 'contact_city',       'Al-Ahsa',                             'string',  'City',              true,  4],
            ['contact', 'contact_country',    'Saudi Arabia',                        'string',  'Country',           true,  5],
            ['contact', 'maps_embed_url',     '',                                    'string',  'Google Maps URL',   false, 6],

            // ── Social ───────────────────────────────────────────────────────
            ['social', 'social_twitter',      '',                                    'string',  'Twitter/X URL',     true,  0],
            ['social', 'social_linkedin',     '',                                    'string',  'LinkedIn URL',      true,  1],
            ['social', 'social_github',       '',                                    'string',  'GitHub URL',        true,  2],
            ['social', 'social_instagram',    '',                                    'string',  'Instagram URL',     true,  3],
            ['social', 'social_youtube',      '',                                    'string',  'YouTube URL',       true,  4],
            ['social', 'social_facebook',     '',                                    'string',  'Facebook URL',      true,  5],

            // ── Footer ───────────────────────────────────────────────────────
            ['footer', 'footer_tagline',      'Built for students, by students.',    'string',  'Footer Tagline',    true,  0],
            ['footer', 'footer_copyright',    '© 2026 King Faisal University. All rights reserved.', 'string', 'Copyright Text', true, 1],
            ['footer', 'footer_show_socials', '1',                                   'boolean', 'Show Socials',      false, 2],
            ['footer', 'footer_show_links',   '1',                                   'boolean', 'Show Links',        false, 3],
            ['footer', 'footer_links',        json_encode([
                ['label' => 'Privacy Policy', 'url' => '/privacy', 'target' => '_self'],
                ['label' => 'Terms of Use',   'url' => '/terms',   'target' => '_self'],
                ['label' => 'Contact',        'url' => '/contact', 'target' => '_self'],
            ]),                                                                       'json',    'Footer Links',      false, 4],
        ];

        foreach ($rows as [$group, $key, $value, $type, $label, $isPublic, $order]) {
            SiteSetting::updateOrCreate(
                ['group' => $group, 'key' => $key],
                [
                    'value'      => $value,
                    'type'       => $type,
                    'label'      => $label,
                    'is_public'  => $isPublic,
                    'sort_order' => $order,
                ]
            );
        }

        // Bust all known cache keys
        $keys = array_column($rows, 1);
        foreach ($keys as $key) {
            Cache::forget("site_setting:{$key}");
        }
        foreach (['general', 'branding', 'seo', 'contact', 'social', 'footer'] as $g) {
            Cache::forget("site_settings_group:{$g}");
        }
        Cache::forget('site_settings_public');
    }
}
