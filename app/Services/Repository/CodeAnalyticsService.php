<?php

namespace App\Services\Repository;

use App\Models\RepositoryAnalytic;
use App\Models\RepositoryUpload;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CodeAnalyticsService
{
    // ─── Extension → Language map ─────────────────────────────────────

    private const EXT_LANGUAGE = [
        'php'       => 'PHP',
        'js'        => 'JavaScript',
        'mjs'       => 'JavaScript',
        'cjs'       => 'JavaScript',
        'jsx'       => 'JavaScript',
        'ts'        => 'TypeScript',
        'tsx'       => 'TypeScript',
        'py'        => 'Python',
        'rb'        => 'Ruby',
        'java'      => 'Java',
        'kt'        => 'Kotlin',
        'kts'       => 'Kotlin',
        'swift'     => 'Swift',
        'go'        => 'Go',
        'rs'        => 'Rust',
        'c'         => 'C',
        'h'         => 'C',
        'cpp'       => 'C++',
        'cc'        => 'C++',
        'cxx'       => 'C++',
        'hpp'       => 'C++',
        'cs'        => 'C#',
        'fs'        => 'F#',
        'fsx'       => 'F#',
        'scala'     => 'Scala',
        'html'      => 'HTML',
        'htm'       => 'HTML',
        'css'       => 'CSS',
        'scss'      => 'SCSS',
        'sass'      => 'Sass',
        'less'      => 'Less',
        'vue'       => 'Vue',
        'svelte'    => 'Svelte',
        'json'      => 'JSON',
        'xml'       => 'XML',
        'yaml'      => 'YAML',
        'yml'       => 'YAML',
        'toml'      => 'TOML',
        'sql'       => 'SQL',
        'sh'        => 'Shell',
        'bash'      => 'Shell',
        'zsh'       => 'Shell',
        'fish'      => 'Shell',
        'ps1'       => 'PowerShell',
        'bat'       => 'Batch',
        'cmd'       => 'Batch',
        'r'         => 'R',
        'dart'      => 'Dart',
        'lua'       => 'Lua',
        'ex'        => 'Elixir',
        'exs'       => 'Elixir',
        'erl'       => 'Erlang',
        'hs'        => 'Haskell',
        'elm'       => 'Elm',
        'clj'       => 'Clojure',
        'cljs'      => 'ClojureScript',
        'tf'        => 'HCL',
        'hcl'       => 'HCL',
        'graphql'   => 'GraphQL',
        'gql'       => 'GraphQL',
        'prisma'    => 'Prisma',
        'md'        => 'Markdown',
        'mdx'       => 'MDX',
        'txt'       => 'Text',
        'dockerfile' => 'Dockerfile',
        'makefile'  => 'Makefile',
        'gradle'    => 'Gradle',
        'groovy'    => 'Groovy',
    ];

    // ─── Language → color (GitHub palette) ───────────────────────────

    private const LANG_COLOR = [
        'PHP'          => '#4F5D95',
        'JavaScript'   => '#F1E05A',
        'TypeScript'   => '#3178C6',
        'Python'       => '#3572A5',
        'Ruby'         => '#701516',
        'Java'         => '#B07219',
        'Kotlin'       => '#A97BFF',
        'Swift'        => '#FA7343',
        'Go'           => '#00ADD8',
        'Rust'         => '#DEA584',
        'C'            => '#555555',
        'C++'          => '#F34B7D',
        'C#'           => '#178600',
        'F#'           => '#B845FC',
        'Scala'        => '#C22D40',
        'HTML'         => '#E34C26',
        'CSS'          => '#563D7C',
        'SCSS'         => '#C6538C',
        'Sass'         => '#A53B70',
        'Less'         => '#1D365D',
        'Vue'          => '#41B883',
        'Svelte'       => '#FF3E00',
        'JSON'         => '#292929',
        'XML'          => '#0060AC',
        'YAML'         => '#CB171E',
        'TOML'         => '#9C4221',
        'SQL'          => '#E38C00',
        'Shell'        => '#89E051',
        'PowerShell'   => '#012456',
        'Batch'        => '#C1F12E',
        'R'            => '#198CE7',
        'Dart'         => '#00B4AB',
        'Lua'          => '#000080',
        'Elixir'       => '#6E4A7E',
        'Erlang'       => '#B83998',
        'Haskell'      => '#5E5086',
        'Elm'          => '#60B5CC',
        'Clojure'      => '#DB5855',
        'GraphQL'      => '#E10098',
        'HCL'          => '#844FBA',
        'Prisma'       => '#0C344B',
        'Markdown'     => '#083FA1',
        'MDX'          => '#1B1F24',
        'Dockerfile'   => '#384D54',
        'Makefile'     => '#427819',
        'Groovy'       => '#E69F56',
    ];

    // ─── Framework / Library detection rules ─────────────────────────

    // Each entry: [marker_files_or_keys, framework_name, language]
    private const FRAMEWORK_RULES = [
        // PHP
        ['artisan',                             'Laravel',       'PHP'],
        ['composer.json:laravel/framework',     'Laravel',       'PHP'],
        ['composer.json:symfony/framework',     'Symfony',       'PHP'],
        ['composer.json:cakephp/cakephp',       'CakePHP',       'PHP'],
        ['composer.json:slim/slim',             'Slim',          'PHP'],
        ['composer.json:yiisoft/yii2',          'Yii 2',         'PHP'],
        ['composer.json:codeigniter4/framework','CodeIgniter',   'PHP'],
        ['wp-config.php',                       'WordPress',     'PHP'],
        ['wp-settings.php',                     'WordPress',     'PHP'],
        ['joomla.xml',                          'Joomla',        'PHP'],

        // JavaScript / TypeScript
        ['package.json:next',                   'Next.js',       'TypeScript'],
        ['package.json:"next"',                 'Next.js',       'JavaScript'],
        ['package.json:nuxt',                   'Nuxt.js',       'JavaScript'],
        ['package.json:@angular/core',          'Angular',       'TypeScript'],
        ['package.json:react-dom',              'React',         'JavaScript'],
        ['package.json:vue',                    'Vue',           'JavaScript'],
        ['package.json:svelte',                 'Svelte',        'JavaScript'],
        ['package.json:@remix-run/react',       'Remix',         'TypeScript'],
        ['package.json:gatsby',                 'Gatsby',        'JavaScript'],
        ['package.json:astro',                  'Astro',         'TypeScript'],
        ['package.json:express',                'Express',       'JavaScript'],
        ['package.json:fastify',                'Fastify',       'JavaScript'],
        ['package.json:@nestjs/core',           'NestJS',        'TypeScript'],
        ['package.json:electron',               'Electron',      'JavaScript'],

        // Python
        ['manage.py',                           'Django',        'Python'],
        ['requirements.txt:django',             'Django',        'Python'],
        ['requirements.txt:flask',              'Flask',         'Python'],
        ['requirements.txt:fastapi',            'FastAPI',       'Python'],
        ['requirements.txt:tornado',            'Tornado',       'Python'],
        ['pyproject.toml:django',               'Django',        'Python'],
        ['pyproject.toml:flask',                'Flask',         'Python'],
        ['pyproject.toml:fastapi',              'FastAPI',       'Python'],

        // Ruby
        ['Gemfile:rails',                       'Ruby on Rails', 'Ruby'],
        ['Gemfile:sinatra',                     'Sinatra',       'Ruby'],

        // Java / Kotlin
        ['pom.xml:spring-boot',                 'Spring Boot',   'Java'],
        ['pom.xml:spring-framework',            'Spring',        'Java'],
        ['build.gradle:spring-boot',            'Spring Boot',   'Kotlin'],

        // Go
        ['go.mod:gin-gonic',                    'Gin',           'Go'],
        ['go.mod:echo',                         'Echo',          'Go'],
        ['go.mod:fiber',                        'Fiber',         'Go'],

        // Rust
        ['Cargo.toml:actix-web',                'Actix',         'Rust'],
        ['Cargo.toml:axum',                     'Axum',          'Rust'],

        // Mobile
        ['pubspec.yaml:flutter',                'Flutter',       'Dart'],
        ['package.json:react-native',           'React Native',  'JavaScript'],
        ['package.json:expo',                   'Expo',          'JavaScript'],

        // C# / .NET
        ['.csproj:Microsoft.AspNetCore',        'ASP.NET Core',  'C#'],
        ['Startup.cs',                          'ASP.NET Core',  'C#'],
        ['Program.cs',                          'ASP.NET Core',  'C#'],
    ];

    // ─── Library detection (package.json / composer.json / requirements.txt) ──

    private const LIBRARY_RULES = [
        // JS/TS UI
        ['package.json:tailwindcss',            'Tailwind CSS',     'JavaScript'],
        ['package.json:@chakra-ui',             'Chakra UI',        'JavaScript'],
        ['package.json:@mui/material',          'Material UI',      'JavaScript'],
        ['package.json:antd',                   'Ant Design',       'JavaScript'],
        ['package.json:shadcn',                 'shadcn/ui',        'TypeScript'],
        ['package.json:@radix-ui',              'Radix UI',         'TypeScript'],
        ['package.json:framer-motion',          'Framer Motion',    'JavaScript'],
        ['package.json:gsap',                   'GSAP',             'JavaScript'],
        ['package.json:three',                  'Three.js',         'JavaScript'],
        ['package.json:d3',                     'd3.js',            'JavaScript'],
        ['package.json:recharts',               'Recharts',         'JavaScript'],
        ['package.json:chart.js',               'Chart.js',         'JavaScript'],
        ['package.json:axios',                  'Axios',            'JavaScript'],
        ['package.json:@tanstack/react-query',  'TanStack Query',   'TypeScript'],
        ['package.json:zustand',                'Zustand',          'TypeScript'],
        ['package.json:redux',                  'Redux',            'JavaScript'],
        ['package.json:@reduxjs/toolkit',       'Redux Toolkit',    'TypeScript'],
        ['package.json:zod',                    'Zod',              'TypeScript'],
        ['package.json:prisma',                 'Prisma',           'TypeScript'],
        ['package.json:drizzle-orm',            'Drizzle ORM',      'TypeScript'],
        ['package.json:mongoose',               'Mongoose',         'JavaScript'],
        ['package.json:sequelize',              'Sequelize',        'JavaScript'],
        ['package.json:typeorm',                'TypeORM',          'TypeScript'],
        ['package.json:socket.io',              'Socket.io',        'JavaScript'],
        ['package.json:graphql',                'GraphQL',          'JavaScript'],
        ['package.json:@apollo/client',         'Apollo Client',    'TypeScript'],
        ['package.json:lucide-react',           'Lucide React',     'TypeScript'],
        ['package.json:react-hook-form',        'React Hook Form',  'TypeScript'],
        ['package.json:vite',                   'Vite',             'JavaScript'],
        ['package.json:webpack',                'Webpack',          'JavaScript'],
        ['package.json:vitest',                 'Vitest',           'JavaScript'],
        ['package.json:jest',                   'Jest',             'JavaScript'],
        ['package.json:playwright',             '@playwright',      'JavaScript'],
        ['package.json:cypress',                'Cypress',          'JavaScript'],

        // PHP
        ['composer.json:inertiajs/inertia-laravel', 'Inertia.js', 'PHP'],
        ['composer.json:livewire/livewire',          'Livewire',   'PHP'],
        ['composer.json:spatie/laravel-permission',  'Spatie Permission', 'PHP'],
        ['composer.json:spatie/laravel-medialibrary','Spatie MediaLibrary','PHP'],
        ['composer.json:doctrine/orm',               'Doctrine ORM','PHP'],
        ['composer.json:guzzlehttp/guzzle',          'Guzzle HTTP','PHP'],
        ['composer.json:league/flysystem',           'Flysystem',  'PHP'],

        // Python
        ['requirements.txt:pandas',             'Pandas',           'Python'],
        ['requirements.txt:numpy',              'NumPy',            'Python'],
        ['requirements.txt:scikit-learn',       'Scikit-learn',     'Python'],
        ['requirements.txt:tensorflow',         'TensorFlow',       'Python'],
        ['requirements.txt:torch',              'PyTorch',          'Python'],
        ['requirements.txt:sqlalchemy',         'SQLAlchemy',       'Python'],
        ['requirements.txt:celery',             'Celery',           'Python'],
        ['requirements.txt:pydantic',           'Pydantic',         'Python'],
        ['requirements.txt:requests',           'Requests',         'Python'],

        // Ruby
        ['Gemfile:devise',                      'Devise',           'Ruby'],
        ['Gemfile:rspec',                       'RSpec',            'Ruby'],
        ['Gemfile:sidekiq',                     'Sidekiq',          'Ruby'],
    ];

    // ─── Public API ───────────────────────────────────────────────────

    public function analyse(RepositoryUpload $upload): RepositoryAnalytic
    {
        $extractPath = Storage::disk('local')->path($upload->extract_path);

        $files     = $this->gatherFiles($extractPath);
        $langStats = $this->computeLanguageStats($files, $extractPath);
        $locStats  = $this->computeLocStats($files, $extractPath);
        $fileTypes = $this->computeFileTypes($files);
        $topFiles  = $this->computeTopFiles($files, $extractPath);
        $frameworks = $this->detectFrameworks($extractPath);
        $libraries  = $this->detectLibraries($extractPath);

        $totalBytes   = array_sum(array_column($files, 'size'));
        $avgSizeKb    = count($files) > 0 ? round($totalBytes / count($files) / 1024, 2) : 0;
        $maxLines     = count($topFiles) > 0 ? (int) $topFiles[0]['lines'] : 0;
        $primaryLang  = count($langStats) > 0 ? $langStats[0]['name'] : null;

        return RepositoryAnalytic::updateOrCreate(
            ['repository_upload_id' => $upload->id],
            [
                'id'                   => (string) \Illuminate\Support\Str::uuid(),
                'total_files'          => count($files),
                'total_lines'          => $locStats['total'],
                'code_lines'           => $locStats['code'],
                'comment_lines'        => $locStats['comment'],
                'blank_lines'          => $locStats['blank'],
                'total_bytes'          => $totalBytes,
                'languages'            => $langStats,
                'frameworks'           => $frameworks,
                'libraries'            => $libraries,
                'file_types'           => $fileTypes,
                'top_files'            => $topFiles,
                'primary_language'     => $primaryLang,
                'avg_file_size_kb'     => $avgSizeKb,
                'max_file_lines'       => $maxLines,
                'analysed_at'          => now()->toISOString(),
            ]
        );
    }

    // ─── File gathering ───────────────────────────────────────────────

    private function gatherFiles(string $dir): array
    {
        $files   = [];
        $ignored = ['.git', 'node_modules', 'vendor', '.svn', '__pycache__', '.idea', '.vscode', 'dist', 'build', '.next', '.nuxt', 'coverage', '.cache'];

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveCallbackFilterIterator(
                new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
                function (\SplFileInfo $file, $key, \RecursiveDirectoryIterator $iter) use ($ignored): bool {
                    if ($iter->hasChildren() && in_array($file->getFilename(), $ignored)) {
                        return false;
                    }
                    return true;
                }
            )
        );

        foreach ($iterator as $file) {
            if (! $file->isFile()) continue;
            $ext = strtolower($file->getExtension());
            // Include files with no extension (Makefile, Dockerfile…) by filename
            $files[] = [
                'path'      => $file->getRealPath(),
                'name'      => $file->getFilename(),
                'ext'       => $ext,
                'size'      => $file->getSize(),
                'language'  => $this->resolveLanguage($file->getFilename(), $ext),
            ];
        }

        return $files;
    }

    private function resolveLanguage(string $filename, string $ext): ?string
    {
        // Check extension map
        if (isset(self::EXT_LANGUAGE[$ext])) {
            return self::EXT_LANGUAGE[$ext];
        }
        // Filename-based fallback
        $lower = strtolower($filename);
        if ($lower === 'dockerfile')      return 'Dockerfile';
        if ($lower === 'makefile')        return 'Makefile';
        if ($lower === 'rakefile')        return 'Ruby';
        if ($lower === 'gemfile')         return 'Ruby';
        if ($lower === 'gemfile.lock')    return 'Ruby';
        if ($lower === 'procfile')        return 'Text';
        if ($lower === '.env')            return 'Text';
        if ($lower === '.gitignore')      return 'Text';
        if ($lower === '.editorconfig')   return 'Text';
        return null;
    }

    // ─── Language stats ───────────────────────────────────────────────

    private function computeLanguageStats(array $files, string $extractPath): array
    {
        $byLang = [];
        foreach ($files as $f) {
            $lang = $f['language'];
            if ($lang === null) continue;
            if (! isset($byLang[$lang])) {
                $byLang[$lang] = ['files' => 0, 'bytes' => 0, 'lines' => 0];
            }
            $byLang[$lang]['files']++;
            $byLang[$lang]['bytes'] += $f['size'];
            if ($f['size'] > 0 && $f['size'] < 5 * 1024 * 1024 && $this->isTextFile($f['path'])) {
                $byLang[$lang]['lines'] += $this->countLines($f['path']);
            }
        }

        $totalBytes = array_sum(array_column($byLang, 'bytes'));
        if ($totalBytes === 0) $totalBytes = 1;

        $result = [];
        foreach ($byLang as $lang => $data) {
            $result[] = [
                'name'       => $lang,
                'files'      => $data['files'],
                'lines'      => $data['lines'],
                'bytes'      => $data['bytes'],
                'percentage' => round($data['bytes'] / $totalBytes * 100, 2),
                'color'      => self::LANG_COLOR[$lang] ?? $this->hashColor($lang),
            ];
        }

        usort($result, fn ($a, $b) => $b['bytes'] <=> $a['bytes']);

        return $result;
    }

    // ─── LOC stats ────────────────────────────────────────────────────

    private function computeLocStats(array $files, string $extractPath): array
    {
        $total = $code = $comment = $blank = 0;

        foreach ($files as $f) {
            if ($f['size'] === 0 || $f['size'] > 2 * 1024 * 1024) continue;
            if (! $this->isTextFile($f['path'])) continue;

            $lines = @file($f['path'], FILE_IGNORE_NEW_LINES) ?: [];
            $ext   = $f['ext'];

            foreach ($lines as $line) {
                $total++;
                $trimmed = trim($line);
                if ($trimmed === '') {
                    $blank++;
                } elseif ($this->isCommentLine($trimmed, $ext)) {
                    $comment++;
                } else {
                    $code++;
                }
            }
        }

        return compact('total', 'code', 'comment', 'blank');
    }

    private function isCommentLine(string $trimmed, string $ext): bool
    {
        $singleLine = match (true) {
            in_array($ext, ['php', 'js', 'ts', 'tsx', 'jsx', 'java', 'cs', 'go', 'rs', 'cpp', 'c', 'swift', 'kt', 'scala', 'dart'])
                => str_starts_with($trimmed, '//') || str_starts_with($trimmed, '*') || str_starts_with($trimmed, '/*'),
            in_array($ext, ['py', 'rb', 'sh', 'bash', 'yaml', 'yml', 'toml'])
                => str_starts_with($trimmed, '#'),
            in_array($ext, ['html', 'xml', 'vue', 'svelte'])
                => str_starts_with($trimmed, '<!--'),
            in_array($ext, ['css', 'scss', 'sass', 'less'])
                => str_starts_with($trimmed, '/*') || str_starts_with($trimmed, '*'),
            in_array($ext, ['sql'])
                => str_starts_with($trimmed, '--'),
            default => false,
        };
        return $singleLine;
    }

    // ─── File types ───────────────────────────────────────────────────

    private function computeFileTypes(array $files): array
    {
        $byExt = [];
        foreach ($files as $f) {
            $key = $f['ext'] ?: '(none)';
            if (! isset($byExt[$key])) $byExt[$key] = ['count' => 0, 'bytes' => 0];
            $byExt[$key]['count']++;
            $byExt[$key]['bytes'] += $f['size'];
        }
        $result = [];
        foreach ($byExt as $ext => $data) {
            $result[] = ['extension' => $ext, 'count' => $data['count'], 'bytes' => $data['bytes']];
        }
        usort($result, fn ($a, $b) => $b['count'] <=> $a['count']);
        return array_slice($result, 0, 30);
    }

    // ─── Top files by LOC ─────────────────────────────────────────────

    private function computeTopFiles(array $files, string $extractPath): array
    {
        $scored = [];
        foreach ($files as $f) {
            if ($f['size'] === 0 || $f['size'] > 2 * 1024 * 1024 || ! $this->isTextFile($f['path'])) continue;
            $lines = $this->countLines($f['path']);
            $scored[] = [
                'path'     => str_replace($extractPath . DIRECTORY_SEPARATOR, '', $f['path']),
                'lines'    => $lines,
                'bytes'    => $f['size'],
                'language' => $f['language'] ?? 'Unknown',
            ];
        }
        usort($scored, fn ($a, $b) => $b['lines'] <=> $a['lines']);
        return array_slice($scored, 0, 15);
    }

    // ─── Framework detection ──────────────────────────────────────────

    private function detectFrameworks(string $extractPath): array
    {
        $found      = [];
        $fileCache  = [];

        foreach (self::FRAMEWORK_RULES as [$marker, $name, $language]) {
            if (isset($found[$name])) continue;

            if (str_contains($marker, ':')) {
                [$file, $needle] = explode(':', $marker, 2);
                $content = $fileCache[$file] ?? ($fileCache[$file] = $this->readFirstMatchingFile($extractPath, $file));
                if ($content !== null && stripos($content, $needle) !== false) {
                    $found[$name] = ['name' => $name, 'language' => $language];
                }
            } else {
                if ($this->fileExistsAnywhere($extractPath, $marker)) {
                    $found[$name] = ['name' => $name, 'language' => $language];
                }
            }
        }

        return array_values($found);
    }

    // ─── Library detection ────────────────────────────────────────────

    private function detectLibraries(string $extractPath): array
    {
        $found     = [];
        $fileCache = [];

        foreach (self::LIBRARY_RULES as [$marker, $name, $language]) {
            if (isset($found[$name])) continue;

            if (str_contains($marker, ':')) {
                [$file, $needle] = explode(':', $marker, 2);
                $content = $fileCache[$file] ?? ($fileCache[$file] = $this->readFirstMatchingFile($extractPath, $file));
                if ($content !== null && stripos($content, $needle) !== false) {
                    $found[$name] = ['name' => $name, 'language' => $language];
                }
            }
        }

        return array_values($found);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private function countLines(string $path): int
    {
        $handle = @fopen($path, 'rb');
        if (! $handle) return 0;
        $count = 0;
        while (! feof($handle)) {
            $chunk = fread($handle, 65536);
            $count += substr_count($chunk, "\n");
        }
        fclose($handle);
        return $count + 1;
    }

    private function isTextFile(string $path): bool
    {
        $handle = @fopen($path, 'rb');
        if (! $handle) return false;
        $sample = fread($handle, 4096);
        fclose($handle);
        if ($sample === false || strlen($sample) === 0) return true;
        $nonPrint = preg_match_all('/[^\x09\x0A\x0D\x20-\x7E]/', $sample);
        return ($nonPrint / strlen($sample)) < 0.30;
    }

    private function readFirstMatchingFile(string $root, string $filename): ?string
    {
        $lower = strtolower($filename);
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getFilename()) === $lower) {
                $size = $file->getSize();
                if ($size > 5 * 1024 * 1024) return null;
                return @file_get_contents($file->getRealPath()) ?: null;
            }
        }
        return null;
    }

    private function fileExistsAnywhere(string $root, string $filename): bool
    {
        $lower    = strtolower($filename);
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getFilename()) === $lower) {
                return true;
            }
        }
        return false;
    }

    private function hashColor(string $name): string
    {
        $hash = crc32($name);
        $r    = ($hash & 0xFF0000) >> 16;
        $g    = ($hash & 0x00FF00) >> 8;
        $b    = $hash & 0x0000FF;
        return sprintf('#%02X%02X%02X', max(60, $r), max(60, $g), max(60, $b));
    }
}
