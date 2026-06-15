<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Web Development',
                'name_ar' => 'تطوير الويب',
                'description' => 'Projects related to websites, web applications, and web services.',
                'description_ar' => 'مشاريع متعلقة بالمواقع الإلكترونية وتطبيقات الويب والخدمات الإلكترونية.',
                'icon' => 'globe',
                'color' => '#3B82F6',
                'sort_order' => 1,
            ],
            [
                'name' => 'Mobile Applications',
                'name_ar' => 'تطبيقات الجوال',
                'description' => 'iOS, Android, and cross-platform mobile applications.',
                'description_ar' => 'تطبيقات الجوال لأنظمة iOS وAndroid والمنصات المتعددة.',
                'icon' => 'smartphone',
                'color' => '#10B981',
                'sort_order' => 2,
            ],
            [
                'name' => 'Artificial Intelligence',
                'name_ar' => 'الذكاء الاصطناعي',
                'description' => 'Machine learning, deep learning, NLP, and computer vision projects.',
                'description_ar' => 'مشاريع التعلم الآلي والتعلم العميق ومعالجة اللغات الطبيعية ورؤية الحاسوب.',
                'icon' => 'brain',
                'color' => '#8B5CF6',
                'sort_order' => 3,
            ],
            [
                'name' => 'Cybersecurity',
                'name_ar' => 'الأمن السيبراني',
                'description' => 'Network security, ethical hacking, cryptography, and digital forensics.',
                'description_ar' => 'أمن الشبكات والاختراق الأخلاقي والتشفير والجنائيات الرقمية.',
                'icon' => 'shield',
                'color' => '#EF4444',
                'sort_order' => 4,
            ],
            [
                'name' => 'Data Science',
                'name_ar' => 'علم البيانات',
                'description' => 'Data analysis, visualization, big data, and business intelligence.',
                'description_ar' => 'تحليل البيانات والتصور والبيانات الضخمة وذكاء الأعمال.',
                'icon' => 'bar-chart',
                'color' => '#F59E0B',
                'sort_order' => 5,
            ],
            [
                'name' => 'IoT & Embedded Systems',
                'name_ar' => 'إنترنت الأشياء والأنظمة المدمجة',
                'description' => 'Smart devices, Arduino, Raspberry Pi, and sensor networks.',
                'description_ar' => 'الأجهزة الذكية وأردوينو وراسبيري باي وشبكات الاستشعار.',
                'icon' => 'cpu',
                'color' => '#06B6D4',
                'sort_order' => 6,
            ],
            [
                'name' => 'Game Development',
                'name_ar' => 'تطوير الألعاب',
                'description' => '2D/3D games, VR/AR experiences, and interactive simulations.',
                'description_ar' => 'الألعاب ثنائية وثلاثية الأبعاد وتجارب الواقع الافتراضي والمحاكاة التفاعلية.',
                'icon' => 'gamepad',
                'color' => '#EC4899',
                'sort_order' => 7,
            ],
            [
                'name' => 'Cloud & DevOps',
                'name_ar' => 'الحوسبة السحابية وDevOps',
                'description' => 'Cloud infrastructure, CI/CD pipelines, containerization, and automation.',
                'description_ar' => 'البنية التحتية السحابية وخطوط CI/CD والحاويات والأتمتة.',
                'icon' => 'cloud',
                'color' => '#64748B',
                'sort_order' => 8,
            ],
        ];

        foreach ($categories as $data) {
            Category::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                array_merge($data, ['is_active' => true])
            );
        }
    }
}
