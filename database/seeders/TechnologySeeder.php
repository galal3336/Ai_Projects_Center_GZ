<?php

namespace Database\Seeders;

use App\Models\Technology;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TechnologySeeder extends Seeder
{
    public function run(): void
    {
        // Valid types: language, framework, library, tool, database, platform, protocol, other
        $technologies = [
            // Languages
            ['name' => 'TypeScript',  'type' => 'language', 'color' => '#3178C6'],
            ['name' => 'Python',      'type' => 'language', 'color' => '#3776AB'],
            ['name' => 'PHP',         'type' => 'language', 'color' => '#777BB4'],
            ['name' => 'Java',        'type' => 'language', 'color' => '#ED8B00'],
            ['name' => 'C++',         'type' => 'language', 'color' => '#00599C'],
            ['name' => 'Swift',       'type' => 'language', 'color' => '#FA7343'],
            ['name' => 'Kotlin',      'type' => 'language', 'color' => '#7F52FF'],

            // Frameworks
            ['name' => 'React',       'type' => 'framework', 'color' => '#61DAFB'],
            ['name' => 'Vue.js',      'type' => 'framework', 'color' => '#42B883'],
            ['name' => 'Angular',     'type' => 'framework', 'color' => '#DD0031'],
            ['name' => 'Next.js',     'type' => 'framework', 'color' => '#000000'],
            ['name' => 'Tailwind CSS','type' => 'framework', 'color' => '#38BDF8'],
            ['name' => 'Laravel',     'type' => 'framework', 'color' => '#FF2D20'],
            ['name' => 'Node.js',     'type' => 'platform',  'color' => '#339933'],
            ['name' => 'Django',      'type' => 'framework', 'color' => '#092E20'],
            ['name' => 'FastAPI',     'type' => 'framework', 'color' => '#009688'],
            ['name' => 'Spring Boot', 'type' => 'framework', 'color' => '#6DB33F'],
            ['name' => 'Express.js',  'type' => 'framework', 'color' => '#000000'],
            ['name' => 'Flutter',     'type' => 'framework', 'color' => '#54C5F8'],
            ['name' => 'React Native','type' => 'framework', 'color' => '#61DAFB'],
            ['name' => 'TensorFlow',  'type' => 'library',   'color' => '#FF6F00'],
            ['name' => 'PyTorch',     'type' => 'library',   'color' => '#EE4C2C'],
            ['name' => 'OpenCV',      'type' => 'library',   'color' => '#5C3EE8'],

            // Databases
            ['name' => 'MySQL',       'type' => 'database', 'color' => '#4479A1'],
            ['name' => 'PostgreSQL',  'type' => 'database', 'color' => '#4169E1'],
            ['name' => 'MongoDB',     'type' => 'database', 'color' => '#47A248'],
            ['name' => 'Redis',       'type' => 'database', 'color' => '#DC382D'],

            // Platforms / tools
            ['name' => 'Docker',      'type' => 'tool',     'color' => '#2496ED'],
            ['name' => 'Kubernetes',  'type' => 'tool',     'color' => '#326CE5'],
            ['name' => 'AWS',         'type' => 'platform', 'color' => '#FF9900'],
            ['name' => 'Firebase',    'type' => 'platform', 'color' => '#FFCA28'],
            ['name' => 'Arduino',     'type' => 'platform', 'color' => '#00979D'],
            ['name' => 'Unity',       'type' => 'tool',     'color' => '#000000'],
        ];

        foreach ($technologies as $data) {
            Technology::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                array_merge($data, ['is_active' => true])
            );
        }
    }
}
