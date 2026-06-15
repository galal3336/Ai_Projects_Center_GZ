import AiPanel from '@/components/ai/AiPanel';
import StarButton from '@/components/social/StarButton';
import BookmarkButton from '@/components/social/BookmarkButton';
import FollowButton from '@/components/social/FollowButton';
import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
    motion,
    useScroll,
    useTransform,
    useInView,
    AnimatePresence,
    type Variants,
} from 'framer-motion';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

// ─── Motion Variants ──────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
    }),
};

const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 0) => ({
        opacity: 1,
        transition: { duration: 0.45, delay: i * 0.06, ease: 'easeOut' },
    }),
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: (i = 0) => ({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
    }),
};

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────

function Reveal({
    children,
    variants = fadeUp,
    custom = 0,
    className = '',
}: {
    children: React.ReactNode;
    variants?: Variants;
    custom?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px 0px' });
    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            custom={custom}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type NavSection =
    | 'overview'
    | 'gallery'
    | 'tech'
    | 'analytics'
    | 'team'
    | 'timeline'
    | 'readme'
    | 'awards';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const project = {
    id: 1,
    name: 'Neural Notes',
    slug: 'neural-notes',
    tagline: 'AI-powered knowledge management with semantic search and graph visualization.',
    description:
        'Neural Notes is a next-generation note-taking platform that leverages large language models for semantic understanding, automatic tagging, and knowledge graph construction. Built for researchers, developers, and lifelong learners who need their knowledge to connect intelligently.',
    status: 'Published',
    category: 'AI / Productivity',
    visibility: 'Public',
    createdAt: 'January 2024',
    updatedAt: '2 days ago',
    version: 'v2.4.1',
    license: 'MIT',
    stars: 1284,
    forks: 213,
    watchers: 87,
    openIssues: 14,
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1400&q=80',
    gallery: [
        { id: 1, url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80', caption: 'Knowledge Graph View' },
        { id: 2, url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80', caption: 'AI Chat Interface' },
        { id: 3, url: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&q=80', caption: 'Markdown Editor' },
        { id: 4, url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', caption: 'Team Collaboration' },
        { id: 5, url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', caption: 'Analytics Dashboard' },
        { id: 6, url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', caption: 'Mobile View' },
    ],
    technologies: [
        { name: 'TypeScript', color: '#3178c6', category: 'Language', usage: 68 },
        { name: 'Next.js', color: '#ffffff', category: 'Frontend', usage: 22 },
        { name: 'Python', color: '#3572A5', category: 'Backend', usage: 18 },
        { name: 'FastAPI', color: '#059669', category: 'Backend', usage: 14 },
        { name: 'PostgreSQL', color: '#336791', category: 'Database', usage: 12 },
        { name: 'Redis', color: '#dc2626', category: 'Cache', usage: 8 },
        { name: 'OpenAI', color: '#10a37f', category: 'AI/ML', usage: 100 },
        { name: 'Prisma', color: '#2d3748', category: 'ORM', usage: 10 },
        { name: 'Tailwind CSS', color: '#38bdf8', category: 'Styling', usage: 100 },
        { name: 'Docker', color: '#2496ed', category: 'DevOps', usage: 100 },
        { name: 'Vercel', color: '#ffffff', category: 'Deploy', usage: 100 },
        { name: 'Stripe', color: '#6772e5', category: 'Payments', usage: 100 },
    ],
    awards: [
        { id: 1, title: 'Best AI Project', issuer: 'HackMIT 2024', date: 'Mar 2024', icon: 'trophy', color: 'from-yellow-500 to-orange-500' },
        { id: 2, title: "Judge's Choice", issuer: 'Stanford TreeHacks', date: 'Feb 2024', icon: 'star', color: 'from-purple-500 to-pink-500' },
        { id: 3, title: 'Top 5 Product', issuer: 'Product Hunt', date: 'Apr 2024', icon: 'rocket', color: 'from-orange-500 to-red-500' },
        { id: 4, title: 'Open Source Award', issuer: 'GitHub Education', date: 'May 2024', icon: 'heart', color: 'from-pink-500 to-rose-500' },
    ],
    team: [
        { id: 1, name: 'Alex Chen', role: 'Lead Engineer', avatar: 'https://i.pravatar.cc/80?img=11', contributions: 487 },
        { id: 2, name: 'Sarah Kim', role: 'AI/ML Engineer', avatar: 'https://i.pravatar.cc/80?img=5', contributions: 312 },
        { id: 3, name: 'Marcus Rivera', role: 'Frontend Dev', avatar: 'https://i.pravatar.cc/80?img=12', contributions: 198 },
        { id: 4, name: 'Priya Patel', role: 'Backend Dev', avatar: 'https://i.pravatar.cc/80?img=9', contributions: 156 },
    ],
    timeline: [
        { id: 1, date: 'Jan 2024', title: 'Project Kickoff', description: 'Formed team, defined scope, set up repositories and CI/CD pipeline.', type: 'milestone' },
        { id: 2, date: 'Feb 2024', title: 'MVP Released', description: 'Core note-taking with basic AI tagging shipped to 50 beta users.', type: 'release' },
        { id: 3, date: 'Mar 2024', title: 'Knowledge Graph v1', description: 'Launched semantic graph visualization using D3.js and OpenAI embeddings.', type: 'feature' },
        { id: 4, date: 'Mar 2024', title: 'HackMIT Winner', description: 'Won Best AI Project against 200+ teams at HackMIT 2024.', type: 'award' },
        { id: 5, date: 'Apr 2024', title: 'Public Launch', description: 'Launched on Product Hunt, reaching #5 product of the day with 1,200+ upvotes.', type: 'release' },
        { id: 6, date: 'May 2024', title: 'v2.0 — Team Collaboration', description: 'Real-time multiplayer editing, shared workspaces, and role-based access.', type: 'feature' },
        { id: 7, date: 'Jun 2024', title: '1,000 GitHub Stars', description: 'Crossed 1,000 stars on GitHub within 6 months of open-sourcing.', type: 'milestone' },
    ],
    externalLinks: [
        { label: 'Live Demo', url: 'https://neuralnotes.app', icon: 'globe' },
        { label: 'GitHub', url: 'https://github.com/alexchen/neural-notes', icon: 'github' },
        { label: 'Documentation', url: 'https://docs.neuralnotes.app', icon: 'book' },
        { label: 'Video Demo', url: 'https://youtube.com/watch?v=demo', icon: 'play' },
    ],
    relatedProjects: [
        { id: 2, name: 'DevFlow', description: 'GitHub-inspired PM tool for student teams.', language: 'PHP', languageColor: '#4f5d95', stars: 84, cover: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=70' },
        { id: 3, name: 'ML Portfolio Optimizer', description: 'RL agent for portfolio optimization.', language: 'Python', languageColor: '#3572A5', stars: 67, cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=70' },
        { id: 4, name: 'OpenUI', description: '50+ accessible React components with dark mode.', language: 'TypeScript', languageColor: '#3178c6', stars: 63, cover: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=400&q=70' },
    ],
};

const commitActivity = [
    { week: 'Jan W1', commits: 12 }, { week: 'Jan W2', commits: 28 }, { week: 'Jan W3', commits: 19 },
    { week: 'Jan W4', commits: 34 }, { week: 'Feb W1', commits: 45 }, { week: 'Feb W2', commits: 38 },
    { week: 'Feb W3', commits: 52 }, { week: 'Feb W4', commits: 41 }, { week: 'Mar W1', commits: 67 },
    { week: 'Mar W2', commits: 58 }, { week: 'Mar W3', commits: 73 }, { week: 'Mar W4', commits: 89 },
    { week: 'Apr W1', commits: 61 }, { week: 'Apr W2', commits: 94 }, { week: 'Apr W3', commits: 78 },
    { week: 'Apr W4', commits: 102 },
];

const codeLanguages = [
    { lang: 'TypeScript', lines: 18420, color: '#3178c6' },
    { lang: 'Python', lines: 7840, color: '#3572A5' },
    { lang: 'CSS/Tailwind', lines: 3200, color: '#38bdf8' },
    { lang: 'SQL', lines: 1840, color: '#f59e0b' },
    { lang: 'Shell', lines: 620, color: '#10b981' },
];

const repoFiles = [
    { name: 'src/', type: 'folder', size: '--', lastCommit: 'feat: add semantic search', ago: '2d' },
    { name: 'api/', type: 'folder', size: '--', lastCommit: 'fix: embedding rate limits', ago: '4d' },
    { name: 'prisma/', type: 'folder', size: '--', lastCommit: 'chore: add migration v12', ago: '1w' },
    { name: 'tests/', type: 'folder', size: '--', lastCommit: 'test: graph traversal coverage', ago: '3d' },
    { name: 'docker-compose.yml', type: 'file', size: '2.1 KB', lastCommit: 'chore: add redis service', ago: '2w' },
    { name: 'package.json', type: 'file', size: '4.8 KB', lastCommit: 'chore: bump framer-motion', ago: '2d' },
    { name: 'README.md', type: 'file', size: '14.2 KB', lastCommit: 'docs: update setup guide', ago: '5d' },
    { name: '.env.example', type: 'file', size: '1.2 KB', lastCommit: 'chore: add OPENAI_ORG_ID', ago: '1w' },
];

const readmeContent = `# Neural Notes

**AI-powered knowledge management** — semantic search, auto-tagging, knowledge graphs.

## Quick Start

\`\`\`bash
git clone https://github.com/alexchen/neural-notes
cd neural-notes
cp .env.example .env
docker-compose up -d
npm install && npm run dev
\`\`\`

## Features

- **Semantic Search** — Find notes by meaning, not just keywords
- **Auto-tagging** — GPT-4 powered automatic categorization
- **Knowledge Graph** — Visual connections between your ideas
- **Real-time Collaboration** — Multiplayer editing with presence indicators
- **Export** — Markdown, PDF, Notion, and Obsidian compatible

## Architecture

The backend uses **FastAPI** for the AI inference pipeline and **Next.js** for the frontend. Notes are stored in **PostgreSQL** with \`pgvector\` for embedding storage. Redis handles real-time pub/sub for collaboration.

## Contributing

PRs welcome! Please read \`CONTRIBUTING.md\` first. All contributions require tests and documentation.

## License

MIT © 2024 Alex Chen`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function Icon({ name, className = 'w-4 h-4' }: { name: string; className?: string }) {
    const icons: Record<string, React.ReactNode> = {
        star: <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />,
        fork: <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0zM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0z" />,
        eye: <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.825 4.242 9.473 3.5 8 3.5c-1.473 0-2.824.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />,
        issue: <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />,
        globe: <><circle cx="12" cy="12" r="10" strokeWidth="1.5" /><line x1="2" y1="12" x2="22" y2="12" strokeWidth="1.5" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="1.5" /></>,
        github: <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />,
        book: <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.003-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z" />,
        play: <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215z" />,
        folder: <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z" />,
        file: <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 8.75 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011z" />,
        trophy: <path d="M2.5.75A.75.75 0 0 1 3.25 0h9.5a.75.75 0 0 1 .75.75v2.726c0 2.558-1.566 4.778-3.928 5.722C10.607 10.45 12 12.607 12 15.05V16h.25a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1 0-1.5H4v-.95c0-2.443 1.393-4.6 3.428-5.602C5.066 8.254 3.5 6.034 3.5 3.476V.75A.75.75 0 0 1 2.5.75z"/>,
        rocket: <path d="M14.064 0a8.75 8.75 0 0 0-6.187 2.563l-.459.458c-.314.314-.616.641-.904.979H3.31a1.75 1.75 0 0 0-1.49.833L.11 7.607a.75.75 0 0 0 .418 1.11l3.102.954c.037.051.079.1.124.145l2.429 2.428c.046.046.094.088.145.125l.954 3.102a.75.75 0 0 0 1.11.418l2.774-1.707a1.75 1.75 0 0 0 .833-1.49V9.485c.338-.288.665-.59.979-.904l.458-.459A8.75 8.75 0 0 0 16 1.936V1.75A1.75 1.75 0 0 0 14.25 0h-.186z"/>,
        heart: <path d="M4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.565 20.565 0 0 0 8 13.393a20.561 20.561 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5zM8 14.25l-.345.666-.002-.001-.006-.003-.018-.01a7.643 7.643 0 0 1-.31-.17 22.075 22.075 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.08 22.08 0 0 1-3.744 2.584l-.018.01-.006.003h-.002L8 14.25z"/>,
        chevronRight: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />,
        tag: <path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />,
        commit: <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0z" />,
    };
    const isStroke = ['globe', 'chevronRight'].includes(name);
    return (
        <svg
            viewBox={isStroke ? '0 0 24 24' : '0 0 16 16'}
            className={className}
            fill={isStroke ? 'none' : 'currentColor'}
            stroke={isStroke ? 'currentColor' : 'none'}
            aria-hidden="true"
        >
            {icons[name]}
        </svg>
    );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-white/10 bg-[#1a1f2e] px-3 py-2 shadow-xl text-xs">
            <p className="text-white/50 mb-0.5">{label}</p>
            <p className="font-semibold text-purple-300">{payload[0].value} commits</p>
        </div>
    );
}

// ─── Sticky Nav ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: NavSection; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'tech', label: 'Technologies' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'team', label: 'Team' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'readme', label: 'README' },
    { id: 'awards', label: 'Awards' },
];

function StickyNav({ active }: { active: NavSection }) {
    const scroll = (id: NavSection) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    return (
        <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-xl"
        >
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0">
                    {NAV_ITEMS.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => scroll(id)}
                            className={`relative flex-shrink-0 px-4 py-3.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                                active === id ? 'text-white' : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            {label}
                            {active === id && (
                                <motion.span
                                    layoutId="nav-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </motion.nav>
    );
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <Reveal className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-white/45">{subtitle}</p>}
        </Reveal>
    );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────

function GlassCard({ children, className = '', hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
    return (
        <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm ${hover ? 'transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]' : ''} ${className}`}>
            {children}
        </div>
    );
}

// ─── Timeline Event Types ─────────────────────────────────────────────────────

function timelineTypeStyle(type: string) {
    switch (type) {
        case 'milestone': return { dot: 'bg-purple-500', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
        case 'release':   return { dot: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
        case 'feature':   return { dot: 'bg-blue-500', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
        case 'award':     return { dot: 'bg-yellow-500', badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' };
        default:          return { dot: 'bg-white/30', badge: 'bg-white/5 text-white/50 border-white/10' };
    }
}

// ─── README Renderer (simplified markdown) ────────────────────────────────────

function ReadmeRenderer({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    let key = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith('```')) {
            const langLine = line.slice(3).trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(
                <div key={key++} className="my-4 rounded-xl overflow-hidden border border-white/[0.08]">
                    {langLine && (
                        <div className="flex items-center gap-2 bg-white/[0.04] px-4 py-2 border-b border-white/[0.06]">
                            <div className="flex gap-1.5">
                                {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ backgroundColor: c }} className="w-2.5 h-2.5 rounded-full" />)}
                            </div>
                            <span className="text-xs text-white/30 ml-1 font-mono">{langLine}</span>
                        </div>
                    )}
                    <pre className="bg-[#0a0e1a] px-5 py-4 text-sm text-green-300/80 font-mono overflow-x-auto leading-relaxed">
                        <code>{codeLines.join('\n')}</code>
                    </pre>
                </div>
            );
        } else if (line.startsWith('# ')) {
            elements.push(<h1 key={key++} className="text-2xl font-bold text-white mt-2 mb-3">{line.slice(2)}</h1>);
        } else if (line.startsWith('## ')) {
            elements.push(<h2 key={key++} className="text-lg font-semibold text-white mt-6 mb-3 pb-2 border-b border-white/[0.06]">{line.slice(3)}</h2>);
        } else if (line.startsWith('- ')) {
            const content = line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
            elements.push(<li key={key++} className="text-white/65 text-sm leading-relaxed mb-1 ml-4" dangerouslySetInnerHTML={{ __html: content }} />);
        } else if (line.trim()) {
            const content = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>').replace(/`(.+?)`/g, '<code class="bg-white/[0.08] text-purple-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono">$1</code>');
            elements.push(<p key={key++} className="text-white/65 text-sm leading-7 mb-3" dangerouslySetInnerHTML={{ __html: content }} />);
        }
        i++;
    }
    return <div className="readme-content">{elements}</div>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectDetails() {
    const [activeSection, setActiveSection] = useState<NavSection>('overview');
    const [activeGallery, setActiveGallery] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);

    const updateActive = useCallback(() => {
        const sections = NAV_ITEMS.map(({ id }) => document.getElementById(id));
        const scrollY = window.scrollY + 120;
        for (let i = sections.length - 1; i >= 0; i--) {
            const el = sections[i];
            if (el && el.offsetTop <= scrollY) {
                setActiveSection(NAV_ITEMS[i].id);
                return;
            }
        }
        setActiveSection('overview');
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', updateActive, { passive: true });
        return () => window.removeEventListener('scroll', updateActive);
    }, [updateActive]);

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

    const totalLines = codeLanguages.reduce((s, l) => s + l.lines, 0);

    return (
        <>
            <Head title={`${project.name} — Project Details`} />

            <div className="min-h-dvh bg-[#0d1117] text-white" style={{ scrollBehavior: 'smooth' }}>

                {/* Ambient orbs */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                    <div className="absolute -top-60 -left-60 w-[800px] h-[800px] rounded-full bg-purple-700/8 blur-[160px]" />
                    <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-pink-700/7 blur-[130px]" />
                    <div className="absolute bottom-40 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-700/6 blur-[120px]" />
                </div>

                {/* ── HERO ──────────────────────────────────────────────── */}
                <section ref={heroRef} className="relative h-[70vh] min-h-[520px] overflow-hidden">
                    {/* Parallax cover */}
                    <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
                        <img
                            src={project.coverImage}
                            alt={project.name}
                            className="w-full h-full object-cover"
                            width={1400}
                            height={600}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/60 to-[#0d1117]/20" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/80 via-transparent to-transparent" />
                    </motion.div>

                    {/* Hero content */}
                    <motion.div
                        className="relative z-10 flex flex-col justify-end h-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-12"
                        style={{ opacity: heroOpacity }}
                    >
                        {/* Breadcrumb */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex items-center gap-2 text-xs text-white/40 mb-5"
                        >
                            <Link href="/projects" className="hover:text-white/70 transition-colors cursor-pointer">Projects</Link>
                            <Icon name="chevronRight" className="w-3 h-3" />
                            <span className="text-white/60">{project.name}</span>
                        </motion.div>

                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                            <div>
                                {/* Badges row */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.15 }}
                                    className="flex items-center gap-2 mb-4 flex-wrap"
                                >
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium">{project.status}</span>
                                    <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 text-xs">{project.category}</span>
                                    <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/50 border border-white/10 text-xs">{project.version}</span>
                                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs">{project.license}</span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none mb-3"
                                >
                                    {project.name}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.55, delay: 0.3, ease: 'easeOut' }}
                                    className="text-lg text-white/60 max-w-xl leading-relaxed"
                                >
                                    {project.tagline}
                                </motion.p>
                            </div>

                            {/* Hero stats + social actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.35 }}
                                className="flex flex-col gap-3 lg:items-end"
                            >
                                {/* Static legacy stats */}
                                <div className="flex items-center gap-4 lg:gap-6">
                                    {[
                                        { icon: 'fork', val: project.forks, label: 'Forks' },
                                        { icon: 'eye', val: project.watchers, label: 'Views' },
                                        { icon: 'issue', val: project.openIssues, label: 'Issues' },
                                    ].map(({ icon, val, label }) => (
                                        <div key={label} className="text-center">
                                            <div className="flex items-center gap-1.5 text-white/70">
                                                <Icon name={icon} className="w-3.5 h-3.5" />
                                                <span className="text-lg font-bold text-white tabular-nums">{val}</span>
                                            </div>
                                            <p className="text-[11px] text-white/35 mt-0.5 uppercase tracking-wider">{label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Live social buttons */}
                                <div className="flex items-center gap-2 flex-wrap lg:justify-end">
                                    <StarButton
                                        projectId={String(project.id)}
                                        initialCount={project.stars}
                                        size="md"
                                    />
                                    <BookmarkButton
                                        projectId={String(project.id)}
                                        initialCount={0}
                                        size="md"
                                    />
                                    <FollowButton
                                        projectId={String(project.id)}
                                        initialCount={project.watchers}
                                        size="md"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>

                {/* ── STICKY NAV ────────────────────────────────────────── */}
                <StickyNav active={activeSection} />

                {/* ── CONTENT ───────────────────────────────────────────── */}
                <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">

                    {/* ── OVERVIEW ──────────────────────────────────────── */}
                    <section id="overview">
                        <SectionHeading title="Project Overview" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Description */}
                            <Reveal className="lg:col-span-2" custom={0}>
                                <GlassCard className="p-7 h-full">
                                    <p className="text-white/70 leading-8 text-[15px]">{project.description}</p>

                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {['AI-powered', 'Semantic Search', 'Knowledge Graph', 'Real-time Collab', 'Open Source'].map((tag, i) => (
                                            <motion.span
                                                key={tag}
                                                initial={{ opacity: 0, scale: 0.85 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4 + i * 0.06 }}
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-medium"
                                            >
                                                <Icon name="tag" className="w-3 h-3" />
                                                {tag}
                                            </motion.span>
                                        ))}
                                    </div>
                                </GlassCard>
                            </Reveal>

                            {/* Meta card */}
                            <Reveal custom={1}>
                                <GlassCard className="p-6 h-full flex flex-col gap-4">
                                    {[
                                        { label: 'Status', value: project.status, accent: 'text-emerald-400' },
                                        { label: 'Category', value: project.category },
                                        { label: 'Visibility', value: project.visibility },
                                        { label: 'Version', value: project.version },
                                        { label: 'License', value: project.license },
                                        { label: 'Created', value: project.createdAt },
                                        { label: 'Updated', value: project.updatedAt },
                                    ].map(({ label, value, accent }) => (
                                        <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
                                            <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
                                            <span className={`text-sm font-medium ${accent ?? 'text-white/80'}`}>{value}</span>
                                        </div>
                                    ))}
                                </GlassCard>
                            </Reveal>
                        </div>
                    </section>

                    {/* ── GALLERY ───────────────────────────────────────── */}
                    <section id="gallery">
                        <SectionHeading title="Gallery" subtitle={`${project.gallery.length} screenshots`} />

                        {/* Main viewer */}
                        <Reveal custom={0} className="mb-4">
                            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] aspect-video bg-black/40">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={activeGallery}
                                        src={project.gallery[activeGallery].url}
                                        alt={project.gallery[activeGallery].caption}
                                        className="w-full h-full object-cover"
                                        initial={{ opacity: 0, scale: 1.03 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                </AnimatePresence>
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4">
                                    <p className="text-white/80 text-sm font-medium">{project.gallery[activeGallery].caption}</p>
                                </div>
                                {/* Arrows */}
                                {['prev', 'next'].map(dir => (
                                    <button
                                        key={dir}
                                        onClick={() => setActiveGallery(p =>
                                            dir === 'prev'
                                                ? (p - 1 + project.gallery.length) % project.gallery.length
                                                : (p + 1) % project.gallery.length
                                        )}
                                        className={`absolute top-1/2 -translate-y-1/2 ${dir === 'prev' ? 'left-4' : 'right-4'} w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/70 hover:bg-black/70 hover:text-white transition-all duration-200 cursor-pointer backdrop-blur-sm`}
                                        aria-label={dir === 'prev' ? 'Previous' : 'Next'}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                                            {dir === 'prev'
                                                ? <path d="M15 18l-6-6 6-6" />
                                                : <path d="M9 18l6-6-6-6" />
                                            }
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </Reveal>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-6 gap-2">
                            {project.gallery.map((img, idx) => (
                                <Reveal key={img.id} custom={idx * 0.5}>
                                    <button
                                        onClick={() => setActiveGallery(idx)}
                                        className={`relative rounded-xl overflow-hidden aspect-video w-full cursor-pointer transition-all duration-200 ${
                                            idx === activeGallery
                                                ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0d1117]'
                                                : 'opacity-50 hover:opacity-80'
                                        }`}
                                    >
                                        <img src={img.url} alt={img.caption} className="w-full h-full object-cover" loading="lazy" />
                                    </button>
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* ── TECHNOLOGIES ──────────────────────────────────── */}
                    <section id="tech">
                        <SectionHeading title="Technologies" subtitle="Full stack breakdown" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {project.technologies.map((tech, i) => (
                                <Reveal key={tech.name} custom={i * 0.4} variants={scaleIn}>
                                    <GlassCard className="p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tech.color + '22', border: `1px solid ${tech.color}33` }}>
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tech.color }} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white/90 truncate">{tech.name}</p>
                                                <p className="text-[11px] text-white/35">{tech.category}</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: tech.color }}
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${tech.usage}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        </div>
                                    </GlassCard>
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* ── CODE ANALYTICS ────────────────────────────────── */}
                    <section id="analytics">
                        <SectionHeading title="Code Analytics" subtitle="Repository statistics and commit activity" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                            {/* Commit activity area chart */}
                            <Reveal className="lg:col-span-2" custom={0}>
                                <GlassCard className="p-6 h-full" hover={false}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-white/80">Commit Activity</h3>
                                            <p className="text-xs text-white/35 mt-0.5">Last 16 weeks</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-white/40">
                                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                                            <span>Commits</span>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart data={commitActivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                                                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="week" tick={{ fill: '#ffffff30', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                                            <YAxis tick={{ fill: '#ffffff30', fontSize: 10 }} tickLine={false} axisLine={false} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Area type="monotone" dataKey="commits" stroke="#a855f7" strokeWidth={2} fill="url(#commitGrad)" dot={false} activeDot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </GlassCard>
                            </Reveal>

                            {/* Language breakdown */}
                            <Reveal custom={1}>
                                <GlassCard className="p-6 h-full" hover={false}>
                                    <h3 className="text-sm font-semibold text-white/80 mb-5">Language Breakdown</h3>

                                    {/* Segmented bar */}
                                    <div className="flex h-3 rounded-full overflow-hidden mb-5 gap-0.5">
                                        {codeLanguages.map(l => (
                                            <motion.div
                                                key={l.lang}
                                                className="h-full first:rounded-l-full last:rounded-r-full"
                                                style={{ backgroundColor: l.color }}
                                                initial={{ flex: 0 }}
                                                whileInView={{ flex: l.lines }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        {codeLanguages.map((l, idx) => (
                                            <div key={l.lang} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                                                    <span className="text-sm text-white/70">{l.lang}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-white/35 tabular-nums">{l.lines.toLocaleString()}</span>
                                                    <span className="text-xs text-white/50 tabular-nums w-10 text-right">
                                                        {((l.lines / totalLines) * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </Reveal>
                        </div>

                        {/* Stat mini-cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {[
                                { label: 'Total Commits', value: '1,284', color: 'text-purple-300' },
                                { label: 'Lines of Code', value: totalLines.toLocaleString(), color: 'text-blue-300' },
                                { label: 'Contributors', value: project.team.length, color: 'text-pink-300' },
                                { label: 'Open Issues', value: project.openIssues, color: 'text-yellow-300' },
                            ].map(({ label, value, color }, i) => (
                                <Reveal key={label} custom={i * 0.3} variants={scaleIn}>
                                    <GlassCard className="p-5 text-center">
                                        <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                                        <p className="text-xs text-white/35 mt-1 uppercase tracking-wider">{label}</p>
                                    </GlassCard>
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* ── REPOSITORY EXPLORER ───────────────────────────── */}
                    <section>
                        <SectionHeading title="Repository Explorer" subtitle="Browse source files" />
                        <Reveal custom={0}>
                            <GlassCard hover={false} className="overflow-hidden">
                                {/* Repo header bar */}
                                <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                                        <Icon name="commit" className="w-3.5 h-3.5 text-purple-400" />
                                        <span className="text-xs text-white/60 font-mono">main</span>
                                    </div>
                                    <span className="text-xs text-white/30">·</span>
                                    <span className="text-xs text-white/40 font-mono">1,284 commits</span>
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-xs text-white/30 font-mono">Updated {project.updatedAt}</span>
                                    </div>
                                </div>

                                {/* File list */}
                                {repoFiles.map((f, i) => (
                                    <motion.div
                                        key={f.name}
                                        initial={{ opacity: 0, x: -16 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05, duration: 0.35, ease: 'easeOut' }}
                                        className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors duration-150 cursor-pointer group"
                                    >
                                        <Icon
                                            name={f.type === 'folder' ? 'folder' : 'file'}
                                            className={`w-4 h-4 flex-shrink-0 ${f.type === 'folder' ? 'text-blue-400' : 'text-white/40'}`}
                                        />
                                        <span className="text-sm font-mono text-white/80 group-hover:text-purple-300 transition-colors w-44 truncate">{f.name}</span>
                                        <span className="text-xs text-white/35 flex-1 truncate hidden sm:block">{f.lastCommit}</span>
                                        <span className="text-xs text-white/25 w-16 text-right hidden md:block">{f.size}</span>
                                        <span className="text-xs text-white/30 w-12 text-right flex-shrink-0">{f.ago}</span>
                                    </motion.div>
                                ))}
                            </GlassCard>
                        </Reveal>
                    </section>

                    {/* ── TEAM ──────────────────────────────────────────── */}
                    <section id="team">
                        <SectionHeading title="Team Members" subtitle={`${project.team.length} contributors`} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {project.team.map((member, i) => (
                                <Reveal key={member.id} custom={i} variants={scaleIn}>
                                    <GlassCard className="p-5 text-center group">
                                        <div className="relative w-fit mx-auto mb-4">
                                            <img
                                                src={member.avatar}
                                                alt={member.name}
                                                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/[0.08] group-hover:ring-purple-500/50 transition-all duration-300"
                                                width={64}
                                                height={64}
                                                loading="lazy"
                                            />
                                            {i === 0 && (
                                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                                    <Icon name="star" className="w-2.5 h-2.5 text-white" />
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-white/90 text-sm">{member.name}</h3>
                                        <p className="text-xs text-white/40 mt-0.5">{member.role}</p>
                                        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/35">
                                            <Icon name="commit" className="w-3 h-3" />
                                            <span className="tabular-nums">{member.contributions} commits</span>
                                        </div>
                                        {/* Contribution bar */}
                                        <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${(member.contributions / 487) * 100}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        </div>
                                    </GlassCard>
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* ── TIMELINE ──────────────────────────────────────── */}
                    <section id="timeline">
                        <SectionHeading title="Project Timeline" subtitle={`${project.timeline.length} milestones`} />
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-pink-500/30 to-transparent" />

                            <div className="space-y-6">
                                {project.timeline.map((event, i) => {
                                    const style = timelineTypeStyle(event.type);
                                    return (
                                        <Reveal key={event.id} custom={i * 0.4} variants={fadeIn}>
                                            <div className="flex gap-6">
                                                {/* Dot */}
                                                <div className="relative flex-shrink-0">
                                                    <div className={`w-12 h-12 rounded-full ${style.dot}/15 border-2 border-[${style.dot}]/40 flex items-center justify-center relative z-10`}
                                                        style={{ borderColor: style.dot.replace('bg-', '') }}>
                                                        <div className={`w-3 h-3 rounded-full ${style.dot}`} />
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <GlassCard className="flex-1 p-5">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <h3 className="font-semibold text-white/90 text-sm">{event.title}</h3>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className={`px-2 py-0.5 rounded-full text-[11px] border capitalize ${style.badge}`}>{event.type}</span>
                                                            <span className="text-xs text-white/30 font-mono whitespace-nowrap">{event.date}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-white/50 leading-relaxed">{event.description}</p>
                                                </GlassCard>
                                            </div>
                                        </Reveal>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ── README VIEWER ─────────────────────────────────── */}
                    <section id="readme">
                        <SectionHeading title="README" subtitle="Project documentation" />
                        <Reveal custom={0}>
                            <GlassCard hover={false} className="overflow-hidden">
                                {/* Header bar */}
                                <div className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                                    <Icon name="file" className="w-4 h-4 text-white/40" />
                                    <span className="text-sm text-white/60 font-mono">README.md</span>
                                    <div className="ml-auto text-xs text-white/30">Updated 5 days ago</div>
                                </div>
                                <div className="p-7">
                                    <ReadmeRenderer content={readmeContent} />
                                </div>
                            </GlassCard>
                        </Reveal>
                    </section>

                    {/* ── AWARDS ────────────────────────────────────────── */}
                    <section id="awards">
                        <SectionHeading title="Awards & Recognition" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {project.awards.map((award, i) => (
                                <Reveal key={award.id} custom={i} variants={scaleIn}>
                                    <GlassCard className="p-6 text-center group">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${award.color} p-0.5 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <div className="w-full h-full rounded-[14px] bg-[#0d1117] flex items-center justify-center">
                                                <Icon name={award.icon} className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-white/90 text-sm mb-1">{award.title}</h3>
                                        <p className="text-xs text-white/45">{award.issuer}</p>
                                        <p className="text-xs text-white/25 mt-1">{award.date}</p>
                                    </GlassCard>
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* ── EXTERNAL LINKS ────────────────────────────────── */}
                    <section>
                        <SectionHeading title="External Links" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {project.externalLinks.map((link, i) => (
                                <Reveal key={link.label} custom={i * 0.4} variants={scaleIn}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-purple-500/10 hover:border-purple-500/30 transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] group-hover:bg-purple-500/20 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                                            <Icon name={link.icon} className="w-4 h-4 text-white/50 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                        <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">{link.label}</span>
                                        <Icon name="chevronRight" className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-400 ml-auto transition-all duration-200 group-hover:translate-x-0.5" />
                                    </a>
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* ── RELATED PROJECTS ──────────────────────────────── */}
                    <section>
                        <SectionHeading title="Related Projects" />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {project.relatedProjects.map((rp, i) => (
                                <Reveal key={rp.id} custom={i} variants={scaleIn}>
                                    <a href={`/projects/${rp.id}`} className="group block rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05] overflow-hidden transition-all duration-300 cursor-pointer">
                                        <div className="aspect-video overflow-hidden">
                                            <motion.img
                                                src={rp.cover}
                                                alt={rp.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-semibold text-white/90 text-sm group-hover:text-purple-300 transition-colors">{rp.name}</h3>
                                            <p className="text-xs text-white/45 mt-1.5 leading-relaxed line-clamp-2">{rp.description}</p>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rp.languageColor }} />
                                                    <span className="text-xs text-white/40">{rp.language}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-white/35">
                                                    <Icon name="star" className="w-3 h-3" />
                                                    <span>{rp.stars}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* ── AI FEATURES ───────────────────────────────────── */}
                    <Reveal variants={fadeUp}>
                        <section id="ai-features">
                            <SectionHeading title="AI-Powered Analysis" />
                            <AiPanel
                                projectId={String(project.id)}
                                projectTitle={project.name}
                            />
                        </section>
                    </Reveal>

                    {/* Footer */}
                    <div className="border-t border-white/[0.05] pt-8 text-center">
                        <p className="text-xs text-white/20">Built with Laravel · Inertia · React · Framer Motion · Recharts</p>
                    </div>
                </div>
            </div>
        </>
    );
}
