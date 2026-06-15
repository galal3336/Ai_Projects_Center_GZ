<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admins ────────────────────────────────────────────────────────────
        $admins = [
            [
                'name'     => 'Sarah Mitchell',
                'username' => 'sarah.mitchell',
                'email'    => 'sarah@aikfs.test',
                'profile'  => ['department' => 'Computer Science', 'bio' => 'Platform administrator and CS department head.', 'gender' => 'female'],
            ],
            [
                'name'     => 'Omar Al-Rashid',
                'username' => 'omar.rashid',
                'email'    => 'omar@aikfs.test',
                'profile'  => ['department' => 'Software Engineering', 'bio' => 'مشرف المنصة ورئيس قسم هندسة البرمجيات.', 'gender' => 'male'],
            ],
        ];

        foreach ($admins as $data) {
            $user = User::firstOrCreate(['email' => $data['email']], [
                'name'              => $data['name'],
                'username'          => $data['username'],
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole(UserRole::Admin->value);
            UserProfile::firstOrCreate(['user_id' => $user->id], array_merge($data['profile'], [
                'user_id'         => $user->id,
                'enrollment_year' => 2018,
                'academic_level'  => 'postgraduate',
            ]));
        }

        // ── Students ──────────────────────────────────────────────────────────
        $students = [
            // Web dev students
            ['name' => 'Ahmed Al-Zahrani',   'username' => 'ahmed.zahrani',   'email' => 'ahmed@aikfs.test',   'dept' => 'Computer Science',       'year' => 2022, 'gender' => 'male',   'skills' => ['React', 'Laravel', 'MySQL']],
            ['name' => 'Fatima Al-Sayed',    'username' => 'fatima.sayed',    'email' => 'fatima@aikfs.test',   'dept' => 'Information Technology', 'year' => 2021, 'gender' => 'female', 'skills' => ['Vue.js', 'Node.js', 'MongoDB']],
            ['name' => 'Khalid Al-Otaibi',   'username' => 'khalid.otaibi',   'email' => 'khalid@aikfs.test',  'dept' => 'Software Engineering',   'year' => 2023, 'gender' => 'male',   'skills' => ['Next.js', 'TypeScript', 'PostgreSQL']],
            ['name' => 'Noura Al-Ghamdi',    'username' => 'noura.ghamdi',    'email' => 'noura@aikfs.test',   'dept' => 'Computer Science',       'year' => 2022, 'gender' => 'female', 'skills' => ['Python', 'Django', 'Redis']],
            // AI/ML students
            ['name' => 'Mohammed Al-Qahtani','username' => 'mohammed.qahtani','email' => 'mohammed@aikfs.test','dept' => 'Data Science',           'year' => 2021, 'gender' => 'male',   'skills' => ['Python', 'TensorFlow', 'PyTorch']],
            ['name' => 'Lina Al-Harbi',      'username' => 'lina.harbi',      'email' => 'lina@aikfs.test',    'dept' => 'Artificial Intelligence','year' => 2022, 'gender' => 'female', 'skills' => ['Python', 'OpenCV', 'TensorFlow']],
            // Mobile students
            ['name' => 'Yousef Al-Shahrani', 'username' => 'yousef.shahrani', 'email' => 'yousef@aikfs.test',  'dept' => 'Software Engineering',   'year' => 2023, 'gender' => 'male',   'skills' => ['Flutter', 'Dart', 'Firebase']],
            ['name' => 'Reem Al-Dossari',    'username' => 'reem.dossari',    'email' => 'reem@aikfs.test',    'dept' => 'Computer Science',       'year' => 2022, 'gender' => 'female', 'skills' => ['React Native', 'TypeScript', 'Firebase']],
            // Security students
            ['name' => 'Faisal Al-Mutairi',  'username' => 'faisal.mutairi',  'email' => 'faisal@aikfs.test',  'dept' => 'Cybersecurity',          'year' => 2021, 'gender' => 'male',   'skills' => ['Python', 'C++', 'Linux']],
            ['name' => 'Hala Al-Enezi',      'username' => 'hala.enezi',      'email' => 'hala@aikfs.test',    'dept' => 'Cybersecurity',          'year' => 2022, 'gender' => 'female', 'skills' => ['Python', 'Wireshark', 'Metasploit']],
            // IoT students
            ['name' => 'Turki Al-Subaiee',   'username' => 'turki.subaiee',   'email' => 'turki@aikfs.test',   'dept' => 'Electrical Engineering', 'year' => 2021, 'gender' => 'male',   'skills' => ['Arduino', 'C++', 'IoT']],
            ['name' => 'Dana Al-Qahtani',    'username' => 'dana.qahtani',    'email' => 'dana@aikfs.test',    'dept' => 'Computer Engineering',   'year' => 2023, 'gender' => 'female', 'skills' => ['Raspberry Pi', 'Python', 'MQTT']],
            // Game dev
            ['name' => 'Sultan Al-Bishi',    'username' => 'sultan.bishi',    'email' => 'sultan@aikfs.test',  'dept' => 'Digital Media',          'year' => 2022, 'gender' => 'male',   'skills' => ['Unity', 'C#', 'Blender']],
            ['name' => 'Maha Al-Shehri',     'username' => 'maha.shehri',     'email' => 'maha@aikfs.test',    'dept' => 'Computer Science',       'year' => 2023, 'gender' => 'female', 'skills' => ['Unreal Engine', 'C++', '3D Modeling']],
            // Extra students for variety
            ['name' => 'Abdulaziz Al-Dosari','username' => 'abdulaziz.dosari','email' => 'abdulaziz@aikfs.test','dept' => 'Information Systems',   'year' => 2020, 'gender' => 'male',   'skills' => ['PHP', 'MySQL', 'JavaScript']],
        ];

        foreach ($students as $data) {
            $user = User::firstOrCreate(['email' => $data['email']], [
                'name'              => $data['name'],
                'username'          => $data['username'],
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole(UserRole::Student->value);
            UserProfile::firstOrCreate(['user_id' => $user->id], [
                'user_id'          => $user->id,
                'department'       => $data['dept'],
                'enrollment_year'  => $data['year'],
                'graduation_year'  => $data['year'] + 4,
                'academic_level'   => 'third_year',
                'gender'           => $data['gender'],
                'skills'           => $data['skills'],
                'bio'              => "Student at the {$data['dept']} department, passionate about technology and innovation.",
            ]);
        }
    }
}
