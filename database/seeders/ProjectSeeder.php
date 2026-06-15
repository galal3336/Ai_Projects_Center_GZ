<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Category;
use App\Models\Competition;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\ProjectLink;
use App\Models\Technology;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $admin      = User::whereHas('roles', fn ($q) => $q->where('name', 'admin'))->first();
        $students   = User::whereHas('roles', fn ($q) => $q->where('name', 'student'))->get()->keyBy('username');
        $categories = Category::all()->keyBy('slug');
        $techs      = Technology::all()->keyBy('slug');
        $comp2024   = Competition::where('slug', 'university-tech-expo-2024')->first();
        $compAI     = Competition::where('slug', 'ai-data-science-hackathon-2025')->first();
        $compNat    = Competition::where('slug', 'national-innovation-challenge-2024')->first();

        $projects = [
            // ── 1. E-Learning Platform (Web) ────────────────────────────────
            [
                'owner'        => 'ahmed.zahrani',
                'category'     => 'web-development',
                'competition'  => $comp2024,
                'title'        => 'EduFlow — Smart E-Learning Platform',
                'title_ar'     => 'EduFlow — منصة التعلم الإلكتروني الذكية',
                'slug'         => 'eduflow-smart-e-learning-platform',
                'abstract'     => 'A comprehensive e-learning platform with adaptive learning paths, real-time collaboration, and AI-powered quiz generation.',
                'abstract_ar'  => 'منصة تعليم إلكتروني شاملة مع مسارات تعلم تكيفية وتعاون في الوقت الفعلي وتوليد اختبارات مدعوم بالذكاء الاصطناعي.',
                'description'  => '<p>EduFlow is a modern e-learning platform built with Laravel and React. It features adaptive learning paths that adjust to each student\'s performance, real-time collaboration tools, and an AI module that automatically generates quizzes from course content.</p><p>Key features include: video streaming, interactive assignments, progress tracking, instructor dashboard, and mobile-responsive design.</p>',
                'department'   => 'Computer Science',
                'academic_year'=> 2024,
                'academic_level'=> 'fourth_year',
                'supervisor_name' => 'Dr. Abdullah Al-Khalid',
                'course_name'  => 'Senior Project I',
                'status'       => ProjectStatus::Published,
                'visibility'   => ProjectVisibility::Public,
                'is_featured'  => true,
                'views_count'  => 1240,
                'stars_count'  => 87,
                'bookmarks_count' => 34,
                'followers_count' => 21,
                'tags'         => ['education', 'e-learning', 'AI', 'web'],
                'technologies' => ['laravel', 'react', 'mysql', 'redis'],
                'members'      => [
                    ['username' => 'fatima.sayed',  'role' => 'member',     'contribution' => 'Frontend development and UI/UX design'],
                    ['name' => 'Sami Al-Harbi',     'role' => 'supervisor', 'contribution' => 'Project supervision and technical guidance'],
                ],
                'links' => [
                    ['type' => 'github', 'url' => 'https://github.com/example/eduflow', 'label' => 'Source Code'],
                    ['type' => 'demo',   'url' => 'https://eduflow.demo.test',           'label' => 'Live Demo'],
                ],
                'published_at' => now()->subDays(45),
            ],

            // ── 2. AI Skin Disease Detector (AI) ───────────────────────────
            [
                'owner'        => 'mohammed.qahtani',
                'category'     => 'artificial-intelligence',
                'competition'  => $compAI,
                'title'        => 'DermAI — Skin Disease Detection System',
                'title_ar'     => 'DermAI — نظام كشف أمراض الجلد',
                'slug'         => 'dermai-skin-disease-detection',
                'abstract'     => 'Deep learning model achieving 94% accuracy in detecting 12 common skin diseases from smartphone photos.',
                'abstract_ar'  => 'نموذج تعلم عميق يحقق دقة 94% في كشف 12 مرضاً جلدياً شائعاً من صور الهاتف الذكي.',
                'description'  => '<p>DermAI uses a fine-tuned EfficientNet-B4 model trained on 50,000+ dermoscopy images. The system classifies 12 common skin conditions including melanoma, psoriasis, and eczema with 94% accuracy.</p><p>A Flutter mobile app allows users to capture or upload skin images and receive instant AI-powered analysis with recommendations to consult a dermatologist.</p>',
                'department'   => 'Data Science',
                'academic_year'=> 2025,
                'academic_level'=> 'graduate',
                'supervisor_name' => 'Dr. Mona Al-Rasheed',
                'course_name'  => 'Deep Learning Applications',
                'status'       => ProjectStatus::Published,
                'visibility'   => ProjectVisibility::Public,
                'is_featured'  => true,
                'views_count'  => 2850,
                'stars_count'  => 142,
                'bookmarks_count' => 98,
                'followers_count' => 57,
                'tags'         => ['AI', 'healthcare', 'deep-learning', 'mobile'],
                'technologies' => ['python', 'tensorflow', 'flutter', 'firebase'],
                'members'      => [
                    ['username' => 'lina.harbi', 'role' => 'member', 'contribution' => 'Model training and mobile app development'],
                ],
                'links' => [
                    ['type' => 'github',  'url' => 'https://github.com/example/dermai',    'label' => 'Source Code'],
                    ['type' => 'paper',   'url' => 'https://arxiv.example.com/dermai-2025', 'label' => 'Research Paper'],
                ],
                'published_at' => now()->subDays(30),
            ],

            // ── 3. Smart Home IoT System ───────────────────────────────────
            [
                'owner'        => 'turki.subaiee',
                'category'     => 'iot-embedded-systems',
                'competition'  => $compNat,
                'title'        => 'SmartNest — IoT Home Automation System',
                'title_ar'     => 'SmartNest — نظام أتمتة المنزل الذكي',
                'slug'         => 'smartnest-iot-home-automation',
                'abstract'     => 'A comprehensive IoT system for home automation using ESP32 microcontrollers, MQTT protocol, and a React dashboard.',
                'abstract_ar'  => 'نظام إنترنت أشياء شامل لأتمتة المنزل باستخدام متحكمات ESP32 وبروتوكول MQTT ولوحة تحكم React.',
                'description'  => '<p>SmartNest connects ESP32-based sensors and actuators across the home via an MQTT broker. The system controls lighting, temperature, security cameras, and door locks through a real-time React dashboard or voice commands.</p><p>Features include energy consumption monitoring, automated schedules, anomaly detection, and integration with Google Home.</p>',
                'department'   => 'Electrical Engineering',
                'academic_year'=> 2024,
                'academic_level'=> 'fourth_year',
                'supervisor_name' => 'Dr. Rashed Al-Fahad',
                'course_name'  => 'Embedded Systems Design',
                'status'       => ProjectStatus::Published,
                'visibility'   => ProjectVisibility::Public,
                'is_featured'  => true,
                'views_count'  => 1890,
                'stars_count'  => 103,
                'bookmarks_count' => 67,
                'followers_count' => 39,
                'tags'         => ['IoT', 'smart-home', 'ESP32', 'MQTT'],
                'technologies' => ['arduino', 'python', 'react', 'mysql'],
                'members'      => [
                    ['username' => 'dana.qahtani', 'role' => 'member', 'contribution' => 'Backend API and dashboard development'],
                ],
                'links' => [
                    ['type' => 'github', 'url' => 'https://github.com/example/smartnest', 'label' => 'Source Code'],
                    ['type' => 'video',  'url' => 'https://youtube.com/watch?v=example',   'label' => 'Demo Video'],
                ],
                'published_at' => now()->subDays(60),
            ],

            // ── 4. Cybersecurity Vulnerability Scanner ─────────────────────
            [
                'owner'        => 'faisal.mutairi',
                'category'     => 'cybersecurity',
                'competition'  => null,
                'title'        => 'VulnScan — Automated Web Vulnerability Scanner',
                'title_ar'     => 'VulnScan — ماسح ثغرات الويب الآلي',
                'slug'         => 'vulnscan-automated-web-vulnerability-scanner',
                'abstract'     => 'An automated web application scanner that detects OWASP Top 10 vulnerabilities with detailed remediation reports.',
                'abstract_ar'  => 'ماسح آلي لتطبيقات الويب يكشف ثغرات OWASP Top 10 مع تقارير تفصيلية للمعالجة.',
                'description'  => '<p>VulnScan is a Python-based automated scanner that tests web applications for the OWASP Top 10 vulnerabilities including SQL injection, XSS, CSRF, and insecure direct object references.</p><p>The tool generates detailed HTML/PDF reports with severity ratings, proof-of-concept payloads, and step-by-step remediation guides.</p>',
                'department'   => 'Cybersecurity',
                'academic_year'=> 2024,
                'academic_level'=> 'fourth_year',
                'supervisor_name' => 'Dr. Saeed Al-Ghamdi',
                'course_name'  => 'Ethical Hacking & Penetration Testing',
                'status'       => ProjectStatus::Published,
                'visibility'   => ProjectVisibility::Public,
                'is_featured'  => false,
                'views_count'  => 975,
                'stars_count'  => 64,
                'bookmarks_count' => 41,
                'followers_count' => 18,
                'tags'         => ['security', 'OWASP', 'penetration-testing', 'Python'],
                'technologies' => ['python', 'postgresql', 'docker'],
                'members'      => [
                    ['username' => 'hala.enezi', 'role' => 'member', 'contribution' => 'XSS and CSRF detection modules'],
                ],
                'links' => [
                    ['type' => 'github', 'url' => 'https://github.com/example/vulnscan', 'label' => 'Source Code'],
                    ['type' => 'documentation',   'url' => 'https://docs.vulnscan.test',           'label' => 'Documentation'],
                ],
                'published_at' => now()->subDays(20),
            ],

            // ── 5. Recipe Recommendation App (Mobile) ─────────────────────
            [
                'owner'        => 'reem.dossari',
                'category'     => 'mobile-applications',
                'competition'  => null,
                'title'        => 'ChefMate — AI Recipe Recommendation App',
                'title_ar'     => 'ChefMate — تطبيق اقتراح الوصفات بالذكاء الاصطناعي',
                'slug'         => 'chefmate-ai-recipe-recommendation-app',
                'abstract'     => 'A cross-platform mobile app that recommends recipes based on available ingredients using NLP and collaborative filtering.',
                'abstract_ar'  => 'تطبيق جوال متعدد المنصات يقترح وصفات بناءً على المكونات المتاحة باستخدام NLP والتصفية التعاونية.',
                'description'  => '<p>ChefMate uses a hybrid recommendation engine combining NLP ingredient parsing and collaborative filtering to suggest personalized recipes. Users scan pantry items with the camera, and the app finds matching recipes instantly.</p><p>Features: 50,000+ recipes, dietary filters, nutrition tracking, grocery list generation, and Arabic/English support.</p>',
                'department'   => 'Computer Science',
                'academic_year'=> 2024,
                'academic_level'=> 'third_year',
                'supervisor_name' => 'Dr. Hanan Al-Mohanna',
                'course_name'  => 'Mobile Application Development',
                'status'       => ProjectStatus::Published,
                'visibility'   => ProjectVisibility::Public,
                'is_featured'  => false,
                'views_count'  => 734,
                'stars_count'  => 48,
                'bookmarks_count' => 29,
                'followers_count' => 12,
                'tags'         => ['mobile', 'AI', 'food', 'recommendation'],
                'technologies' => ['react-native', 'typescript', 'firebase', 'python'],
                'members'      => [
                    ['username' => 'yousef.shahrani', 'role' => 'member', 'contribution' => 'Backend API and recommendation engine'],
                ],
                'links' => [
                    ['type' => 'github',    'url' => 'https://github.com/example/chefmate',        'label' => 'Source Code'],
                    ['type' => 'playstore', 'url' => 'https://play.google.com/store/example',       'label' => 'Google Play'],
                ],
                'published_at' => now()->subDays(15),
            ],

            // ── 6. 3D Platformer Game ──────────────────────────────────────
            [
                'owner'        => 'sultan.bishi',
                'category'     => 'game-development',
                'competition'  => null,
                'title'        => 'Desert Quest — 3D Adventure Game',
                'title_ar'     => 'Desert Quest — لعبة مغامرات ثلاثية الأبعاد',
                'slug'         => 'desert-quest-3d-adventure-game',
                'abstract'     => 'A 3D platformer adventure game set in ancient Arabia, featuring procedurally generated levels and AI-driven NPCs.',
                'abstract_ar'  => 'لعبة مغامرات ثلاثية الأبعاد تدور أحداثها في شبه الجزيرة العربية القديمة مع مستويات مولّدة إجرائياً وشخصيات NPC مدفوعة بالذكاء الاصطناعي.',
                'description'  => '<p>Desert Quest is a 3D adventure platformer built in Unity. The game features 10 handcrafted levels set in ancient Arabian landscapes with procedurally generated side areas.</p><p>Key technical achievements: custom AI pathfinding for NPCs, dynamic weather system, Arabic-inspired architectural assets, and an original Arabic music soundtrack.</p>',
                'department'   => 'Digital Media',
                'academic_year'=> 2024,
                'academic_level'=> 'third_year',
                'supervisor_name' => 'Dr. Khalid Al-Subaie',
                'course_name'  => 'Game Design and Development',
                'status'       => ProjectStatus::Published,
                'visibility'   => ProjectVisibility::Public,
                'is_featured'  => false,
                'views_count'  => 1120,
                'stars_count'  => 76,
                'bookmarks_count' => 45,
                'followers_count' => 28,
                'tags'         => ['game', 'Unity', '3D', 'adventure', 'Arabic'],
                'technologies' => ['unity', 'cplusplus'],
                'members'      => [
                    ['username' => 'maha.shehri', 'role' => 'member', 'contribution' => '3D modeling, texturing, and level design'],
                ],
                'links' => [
                    ['type' => 'github', 'url' => 'https://github.com/example/desert-quest', 'label' => 'Source Code'],
                    ['type' => 'demo',   'url' => 'https://itch.io/game/desert-quest',        'label' => 'Play on itch.io'],
                ],
                'published_at' => now()->subDays(25),
            ],

            // ── 7. Data Analytics Dashboard (Data Science) ────────────────
            [
                'owner'        => 'noura.ghamdi',
                'category'     => 'data-science',
                'competition'  => $comp2024,
                'title'        => 'InsightBoard — Real-Time Analytics Dashboard',
                'title_ar'     => 'InsightBoard — لوحة تحليلات البيانات في الوقت الفعلي',
                'slug'         => 'insightboard-real-time-analytics-dashboard',
                'abstract'     => 'A real-time business intelligence dashboard with drag-and-drop chart builder, automated insights, and natural language querying.',
                'abstract_ar'  => 'لوحة ذكاء أعمال في الوقت الفعلي مع منشئ مخططات بالسحب والإفلات ورؤى آلية واستعلامات باللغة الطبيعية.',
                'description'  => '<p>InsightBoard is a full-stack analytics platform. Users connect their data sources (MySQL, PostgreSQL, CSV), and the dashboard automatically detects patterns and anomalies.</p><p>The NLP query engine lets non-technical users ask questions like "show me sales by region last quarter" and get instant visualizations.</p>',
                'department'   => 'Computer Science',
                'academic_year'=> 2024,
                'academic_level'=> 'fourth_year',
                'supervisor_name' => 'Dr. Nadia Al-Yami',
                'course_name'  => 'Business Intelligence Systems',
                'status'       => ProjectStatus::Published,
                'visibility'   => ProjectVisibility::Public,
                'is_featured'  => false,
                'views_count'  => 623,
                'stars_count'  => 39,
                'bookmarks_count' => 22,
                'followers_count' => 9,
                'tags'         => ['data', 'analytics', 'dashboard', 'NLP', 'BI'],
                'technologies' => ['python', 'react', 'postgresql', 'redis'],
                'members'      => [],
                'links' => [
                    ['type' => 'github', 'url' => 'https://github.com/example/insightboard', 'label' => 'Source Code'],
                    ['type' => 'demo',   'url' => 'https://insightboard.demo.test',           'label' => 'Live Demo'],
                ],
                'published_at' => now()->subDays(50),
            ],

            // ── 8. API Gateway (Cloud/DevOps) ──────────────────────────────
            [
                'owner'        => 'khalid.otaibi',
                'category'     => 'cloud-devops',
                'competition'  => null,
                'title'        => 'NexGate — Lightweight API Gateway',
                'title_ar'     => 'NexGate — بوابة API خفيفة الوزن',
                'slug'         => 'nexgate-lightweight-api-gateway',
                'abstract'     => 'A self-hosted API gateway with rate limiting, JWT authentication, request logging, and a visual routing editor.',
                'abstract_ar'  => 'بوابة API ذاتية الاستضافة مع تحديد معدل الطلبات ومصادقة JWT وتسجيل الطلبات ومحرر توجيه مرئي.',
                'description'  => '<p>NexGate is a Node.js-based API gateway designed for microservices architectures. It handles routing, rate limiting (sliding window), JWT/API key auth, and request/response transformation.</p><p>A visual dashboard allows teams to configure routes, monitor traffic in real-time, and set up alerts without touching config files.</p>',
                'department'   => 'Software Engineering',
                'academic_year'=> 2024,
                'academic_level'=> 'fourth_year',
                'supervisor_name' => 'Dr. Yazeed Al-Malki',
                'course_name'  => 'Distributed Systems',
                'status'       => ProjectStatus::Published,
                'visibility'   => ProjectVisibility::Public,
                'is_featured'  => false,
                'views_count'  => 487,
                'stars_count'  => 31,
                'bookmarks_count' => 18,
                'followers_count' => 7,
                'tags'         => ['API', 'gateway', 'microservices', 'DevOps'],
                'technologies' => ['nodejs', 'redis', 'docker', 'mongodb'],
                'members'      => [
                    ['username' => 'abdulaziz.dosari', 'role' => 'member', 'contribution' => 'Routing engine and metrics module'],
                ],
                'links' => [
                    ['type' => 'github', 'url' => 'https://github.com/example/nexgate', 'label' => 'Source Code'],
                    ['type' => 'documentation',   'url' => 'https://docs.nexgate.test',           'label' => 'Documentation'],
                ],
                'published_at' => now()->subDays(10),
            ],

            // ── 9. Pending project (for admin review queue demo) ──────────
            [
                'owner'        => 'lina.harbi',
                'category'     => 'artificial-intelligence',
                'competition'  => $compAI,
                'title'        => 'ArabicNLP — Arabic Text Sentiment Analyzer',
                'title_ar'     => 'ArabicNLP — محلل المشاعر للنصوص العربية',
                'slug'         => 'arabicnlp-arabic-text-sentiment-analyzer',
                'abstract'     => 'A BERT-based model fine-tuned on 200k Arabic social media posts for multi-class sentiment analysis with dialect support.',
                'abstract_ar'  => 'نموذج مبني على BERT ومضبوط على 200,000 منشور في وسائل التواصل الاجتماعي العربية لتحليل المشاعر متعدد الفئات مع دعم اللهجات.',
                'description'  => '<p>ArabicNLP addresses the challenge of sentiment analysis in Arabic, which has limited resources compared to English. The model supports Modern Standard Arabic and five major dialects.</p>',
                'department'   => 'Artificial Intelligence',
                'academic_year'=> 2025,
                'academic_level'=> 'graduate',
                'supervisor_name' => 'Dr. Mona Al-Rasheed',
                'course_name'  => 'Natural Language Processing',
                'status'       => ProjectStatus::Pending,
                'visibility'   => ProjectVisibility::Public,
                'is_featured'  => false,
                'views_count'  => 0,
                'stars_count'  => 0,
                'bookmarks_count' => 0,
                'followers_count' => 0,
                'tags'         => ['NLP', 'Arabic', 'sentiment-analysis', 'BERT'],
                'technologies' => ['python', 'pytorch'],
                'members'      => [],
                'links' => [
                    ['type' => 'github', 'url' => 'https://github.com/example/arabicnlp', 'label' => 'Source Code'],
                ],
                'submitted_at' => now()->subDays(2),
                'published_at' => null,
            ],

            // ── 10. Draft project ──────────────────────────────────────────
            [
                'owner'        => 'yousef.shahrani',
                'category'     => 'mobile-applications',
                'competition'  => null,
                'title'        => 'FitTrack — AI Fitness Coach App',
                'title_ar'     => 'FitTrack — تطبيق المدرب الشخصي بالذكاء الاصطناعي',
                'slug'         => 'fittrack-ai-fitness-coach-app',
                'abstract'     => 'A Flutter fitness app with AI-powered workout plan generation, form correction using pose estimation, and nutrition tracking.',
                'abstract_ar'  => 'تطبيق لياقة بدنية مبني بـ Flutter مع توليد خطط تمرين بالذكاء الاصطناعي وتصحيح الوضعية باستخدام تقدير الوضع وتتبع التغذية.',
                'description'  => '<p>FitTrack uses MediaPipe pose estimation to analyze exercise form in real-time through the phone camera and provide corrective feedback.</p>',
                'department'   => 'Software Engineering',
                'academic_year'=> 2025,
                'academic_level'=> 'third_year',
                'supervisor_name' => null,
                'course_name'  => 'Advanced Mobile Development',
                'status'       => ProjectStatus::Draft,
                'visibility'   => ProjectVisibility::Private,
                'is_featured'  => false,
                'views_count'  => 0,
                'stars_count'  => 0,
                'bookmarks_count' => 0,
                'followers_count' => 0,
                'tags'         => ['mobile', 'fitness', 'AI', 'pose-estimation'],
                'technologies' => ['flutter', 'python', 'firebase'],
                'members'      => [],
                'links'        => [],
                'published_at' => null,
            ],
        ];

        foreach ($projects as $data) {
            $owner = $students[$data['owner']] ?? null;
            if (! $owner) continue;

            $category = $categories[$data['category']] ?? null;

            $project = Project::firstOrCreate(
                ['slug' => $data['slug']],
                [
                    'owner_id'        => $owner->id,
                    'category_id'     => $category?->id,
                    'competition_id'  => $data['competition']?->id,
                    'title'           => $data['title'],
                    'title_ar'        => $data['title_ar'],
                    'abstract'        => $data['abstract'],
                    'abstract_ar'     => $data['abstract_ar'],
                    'description'     => $data['description'],
                    'department'      => $data['department'],
                    'academic_year'   => $data['academic_year'],
                    'academic_level'  => $data['academic_level'],
                    'supervisor_name' => $data['supervisor_name'],
                    'course_name'     => $data['course_name'],
                    'status'          => $data['status'],
                    'visibility'      => $data['visibility'],
                    'is_featured'     => $data['is_featured'],
                    'allow_comments'  => true,
                    'allow_downloads' => true,
                    'views_count'     => $data['views_count'],
                    'stars_count'     => $data['stars_count'],
                    'bookmarks_count' => $data['bookmarks_count'],
                    'followers_count' => $data['followers_count'],
                    'tags'            => $data['tags'],
                    'reviewed_by'     => in_array($data['status'], [ProjectStatus::Published, ProjectStatus::Approved])
                                            ? $admin?->id : null,
                    'reviewed_at'     => in_array($data['status'], [ProjectStatus::Published, ProjectStatus::Approved])
                                            ? now()->subDays(rand(1, 10)) : null,
                    'submitted_at'    => $data['submitted_at'] ?? (
                        $data['status'] !== ProjectStatus::Draft ? now()->subDays(rand(5, 60)) : null
                    ),
                    'published_at'    => $data['published_at'] ?? null,
                ]
            );

            // ── Leader member (owner) ──────────────────────────────────────
            ProjectMember::firstOrCreate(
                ['project_id' => $project->id, 'user_id' => $owner->id],
                [
                    'project_id'    => $project->id,
                    'user_id'       => $owner->id,
                    'name'          => $owner->name,
                    'email'         => $owner->email,
                    'role'          => 'leader',
                    'is_confirmed'  => true,
                    'sort_order'    => 0,
                ]
            );

            // ── Extra members ─────────────────────────────────────────────
            foreach ($data['members'] as $i => $memberData) {
                $memberUser = isset($memberData['username']) ? ($students[$memberData['username']] ?? null) : null;
                ProjectMember::firstOrCreate(
                    [
                        'project_id' => $project->id,
                        'user_id'    => $memberUser?->id,
                        'name'       => $memberData['name'] ?? $memberUser?->name,
                    ],
                    [
                        'project_id'    => $project->id,
                        'user_id'       => $memberUser?->id,
                        'name'          => $memberData['name'] ?? $memberUser?->name,
                        'email'         => $memberUser?->email,
                        'role'          => $memberData['role'],
                        'contribution'  => $memberData['contribution'] ?? null,
                        'is_confirmed'  => true,
                        'sort_order'    => $i + 1,
                    ]
                );
            }

            // ── Technologies ──────────────────────────────────────────────
            $techIds = [];
            foreach ($data['technologies'] as $i => $techSlug) {
                $tech = $techs[$techSlug] ?? null;
                if ($tech) {
                    $techIds[$tech->id] = ['is_primary' => $i === 0, 'sort_order' => $i];
                }
            }
            if ($techIds) {
                $project->technologies()->syncWithoutDetaching($techIds);
                Technology::whereIn('id', array_keys($techIds))->increment('usage_count');
            }

            // ── Links ─────────────────────────────────────────────────────
            foreach ($data['links'] as $i => $link) {
                ProjectLink::firstOrCreate(
                    ['project_id' => $project->id, 'url' => $link['url']],
                    [
                        'project_id' => $project->id,
                        'type'       => $link['type'],
                        'url'        => $link['url'],
                        'label'      => $link['label'],
                        'sort_order' => $i,
                    ]
                );
            }
        }
    }
}
