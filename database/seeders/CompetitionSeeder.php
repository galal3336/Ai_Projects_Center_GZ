<?php

namespace Database\Seeders;

use App\Enums\CompetitionStatus;
use App\Models\Competition;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CompetitionSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::whereHas('roles', fn ($q) => $q->where('name', 'admin'))->first();

        $competitions = [
            [
                'name'        => 'National Innovation Challenge 2024',
                'name_ar'     => 'تحدي الابتكار الوطني 2024',
                'description' => 'A national-level competition for the most innovative software and hardware solutions addressing real-world problems.',
                'description_ar' => 'مسابقة على المستوى الوطني لأفضل الحلول البرمجية والمادية المبتكرة التي تعالج مشكلات الواقع.',
                'organizer'   => 'National Technology Council',
                'level'       => 'national',
                'status'      => CompetitionStatus::Completed,
                'start_date'  => '2024-01-15',
                'end_date'    => '2024-03-30',
                'academic_year' => 2024,
                'is_featured' => true,
                'sort_order'  => 1,
            ],
            [
                'name'        => 'University Tech Expo 2024',
                'name_ar'     => 'معرض التقنية الجامعي 2024',
                'description' => 'Annual university-wide technology exhibition showcasing the best student projects across all departments.',
                'description_ar' => 'المعرض التقني السنوي على مستوى الجامعة الذي يعرض أفضل مشاريع الطلاب في جميع الأقسام.',
                'organizer'   => 'University of Technology',
                'level'       => 'university',
                'status'      => CompetitionStatus::Completed,
                'start_date'  => '2024-04-01',
                'end_date'    => '2024-05-15',
                'academic_year' => 2024,
                'is_featured' => true,
                'sort_order'  => 2,
            ],
            [
                'name'        => 'AI & Data Science Hackathon 2025',
                'name_ar'     => 'هاكاثون الذكاء الاصطناعي وعلم البيانات 2025',
                'description' => 'A 48-hour hackathon focused on building AI-powered solutions for healthcare, education, and sustainability.',
                'description_ar' => 'هاكاثون مدته 48 ساعة يركز على بناء حلول مدعومة بالذكاء الاصطناعي في مجالات الرعاية الصحية والتعليم والاستدامة.',
                'organizer'   => 'AI Research Center',
                'level'       => 'regional',
                'status'      => CompetitionStatus::Active,
                'start_date'  => '2025-02-01',
                'end_date'    => '2025-04-30',
                'academic_year' => 2025,
                'is_featured' => true,
                'sort_order'  => 3,
            ],
            [
                'name'        => 'Cybersecurity CTF Championship 2025',
                'name_ar'     => 'بطولة CTF للأمن السيبراني 2025',
                'description' => 'Capture The Flag competition testing skills in web security, reverse engineering, cryptography, and forensics.',
                'description_ar' => 'مسابقة CTF تختبر المهارات في أمان الويب والهندسة العكسية والتشفير والجنائيات.',
                'organizer'   => 'Cybersecurity Club',
                'level'       => 'university',
                'status'      => CompetitionStatus::Active,
                'start_date'  => '2025-03-01',
                'end_date'    => '2025-06-30',
                'academic_year' => 2025,
                'is_featured' => false,
                'sort_order'  => 4,
            ],
            [
                'name'        => 'Green Tech Innovation Award 2025',
                'name_ar'     => 'جائزة ابتكار التقنية الخضراء 2025',
                'description' => 'Competition for technology projects that contribute to environmental sustainability and climate action.',
                'description_ar' => 'مسابقة لمشاريع التقنية التي تساهم في الاستدامة البيئية والعمل المناخي.',
                'organizer'   => 'Environment & Technology Foundation',
                'level'       => 'national',
                'status'      => CompetitionStatus::Upcoming,
                'start_date'  => '2025-09-01',
                'end_date'    => '2025-12-31',
                'academic_year' => 2025,
                'is_featured' => false,
                'sort_order'  => 5,
            ],
        ];

        foreach ($competitions as $data) {
            Competition::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                array_merge($data, ['created_by' => $admin?->id])
            );
        }
    }
}
