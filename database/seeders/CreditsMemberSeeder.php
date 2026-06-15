<?php

namespace Database\Seeders;

use App\Models\CreditsMember;
use Illuminate\Database\Seeder;

class CreditsMemberSeeder extends Seeder
{
    public function run(): void
    {
        $members = [
            // ── Core Team ──────────────────────────────────────────────────────
            [
                'name'              => 'Dr. Abdullah Al-Khalid',
                'name_ar'           => 'د. عبدالله الخالد',
                'title'             => 'Project Supervisor & Lead Architect',
                'title_ar'          => 'مشرف المشروع والمهندس المعماري الرئيسي',
                'bio'               => 'Professor of Computer Science with 15+ years in software architecture and distributed systems.',
                'bio_ar'            => 'أستاذ في علم الحاسوب مع أكثر من 15 عاماً في هندسة البرمجيات والأنظمة الموزعة.',
                'email'             => 'a.khalid@university.edu.sa',
                'type'              => 'supervisor',
                'category'          => 'leadership',
                'contribution_year' => 2024,
                'is_active'         => true,
                'is_featured'       => true,
                'sort_order'        => 1,
            ],
            [
                'name'              => 'Ahmed Al-Zahrani',
                'name_ar'           => 'أحمد الزهراني',
                'title'             => 'Full-Stack Lead Developer',
                'title_ar'          => 'مطور Full-Stack الرئيسي',
                'bio'               => 'Led the development of the core platform architecture, backend API, and admin dashboard.',
                'bio_ar'            => 'قاد تطوير بنية المنصة الأساسية وAPI الخلفي ولوحة الإدارة.',
                'email'             => 'ahmed@aikfs.test',
                'linkedin_url'      => 'https://linkedin.com/in/ahmed-zahrani',
                'github_url'        => 'https://github.com/ahmed-zahrani',
                'type'              => 'developer',
                'category'          => 'core_team',
                'contribution_year' => 2024,
                'is_active'         => true,
                'is_featured'       => true,
                'sort_order'        => 2,
            ],
            [
                'name'              => 'Fatima Al-Sayed',
                'name_ar'           => 'فاطمة السيد',
                'title'             => 'Frontend Developer & UI/UX Designer',
                'title_ar'          => 'مطورة Frontend ومصممة UI/UX',
                'bio'               => 'Designed and built the React/TypeScript frontend, component library, and bilingual UI system.',
                'bio_ar'            => 'صممت وبنت واجهة React/TypeScript الأمامية ومكتبة المكونات ونظام واجهة ثنائي اللغة.',
                'email'             => 'fatima@aikfs.test',
                'linkedin_url'      => 'https://linkedin.com/in/fatima-sayed',
                'github_url'        => 'https://github.com/fatima-sayed',
                'type'              => 'developer',
                'category'          => 'core_team',
                'contribution_year' => 2024,
                'is_active'         => true,
                'is_featured'       => true,
                'sort_order'        => 3,
            ],
            [
                'name'              => 'Mohammed Al-Qahtani',
                'name_ar'           => 'محمد القحطاني',
                'title'             => 'AI & Search Engineer',
                'title_ar'          => 'مهندس الذكاء الاصطناعي والبحث',
                'bio'               => 'Built the AI analysis pipeline, trending algorithm, and full-text search infrastructure.',
                'bio_ar'            => 'بنى خط أنابيب تحليل الذكاء الاصطناعي وخوارزمية الترند والبنية التحتية للبحث النصي الكامل.',
                'email'             => 'mohammed@aikfs.test',
                'github_url'        => 'https://github.com/mohammed-qahtani',
                'type'              => 'developer',
                'category'          => 'core_team',
                'contribution_year' => 2024,
                'is_active'         => true,
                'is_featured'       => true,
                'sort_order'        => 4,
            ],
            // ── Contributors ───────────────────────────────────────────────────
            [
                'name'              => 'Khalid Al-Otaibi',
                'name_ar'           => 'خالد العتيبي',
                'title'             => 'DevOps & Infrastructure Engineer',
                'title_ar'          => 'مهندس DevOps والبنية التحتية',
                'bio'               => 'Set up Docker, CI/CD pipelines, Redis caching layer, and production deployment configuration.',
                'bio_ar'            => 'أعد Docker وخطوط CI/CD وطبقة تخزين Redis المؤقت وإعدادات نشر الإنتاج.',
                'email'             => 'khalid@aikfs.test',
                'github_url'        => 'https://github.com/khalid-otaibi',
                'type'              => 'contributor',
                'category'          => 'infrastructure',
                'contribution_year' => 2024,
                'is_active'         => true,
                'is_featured'       => false,
                'sort_order'        => 5,
            ],
            [
                'name'              => 'Noura Al-Ghamdi',
                'name_ar'           => 'نورا الغامدي',
                'title'             => 'Arabic Localization Lead',
                'title_ar'          => 'مسؤولة التعريب الرئيسية',
                'bio'               => 'Led Arabic localization, RTL layout, and bilingual content strategy across the platform.',
                'bio_ar'            => 'قادت التعريب ومحاذاة RTL واستراتيجية المحتوى ثنائي اللغة عبر المنصة.',
                'email'             => 'noura@aikfs.test',
                'type'              => 'contributor',
                'category'          => 'localization',
                'contribution_year' => 2024,
                'is_active'         => true,
                'is_featured'       => false,
                'sort_order'        => 6,
            ],
        ];

        foreach ($members as $data) {
            CreditsMember::firstOrCreate(
                ['email' => $data['email']],
                $data
            );
        }
    }
}
