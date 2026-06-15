// ─── Project Domain ───────────────────────────────────────────────────────────

export type ProjectStatus =
    | 'draft' | 'pending' | 'revision' | 'approved'
    | 'published' | 'archived' | 'rejected';

export type ProjectVisibility = 'public' | 'university' | 'private';

export interface ProjectCategory {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
}

export interface ProjectTechnology {
    id: string;
    name: string;
    slug: string;
    type: string | null;
    color: string | null;
    icon_url: string | null;
}

export interface ProjectAward {
    id: string;
    title: string;
    issuer: string | null;
    rank: string | null;
    awarded_at: string | null;
    is_verified: boolean;
}

export interface ProjectMemberSummary {
    id: string;
    name: string;
    role: string;
    avatar: string | null;
}

export interface ProjectOwner {
    id: number;
    name: string;
    avatar: string | null;
}

export interface Project {
    id: string;
    slug: string;
    title: string;
    title_en: string;
    title_ar: string | null;
    abstract: string | null;
    description: string | null;
    thumbnail: string | null;
    status: ProjectStatus;
    status_label: string;
    status_color: string;
    visibility: ProjectVisibility;
    department: string | null;
    academic_year: number | null;
    academic_level: string | null;
    supervisor_name: string | null;
    is_featured: boolean;
    allow_downloads: boolean;
    views_count: number;
    downloads_count: number;
    likes_count: number;
    stars_count: number;
    bookmarks_count: number;
    followers_count: number;
    trending_score: number;
    tags: string[];
    published_at: string | null;
    submitted_at: string | null;
    created_at: string;
    updated_at: string;
    // Auth-user interaction state (injected by controllers when user is authenticated)
    is_starred?: boolean;
    is_bookmarked?: boolean;
    is_following?: boolean;
    owner?: ProjectOwner;
    category?: ProjectCategory;
    technologies?: ProjectTechnology[];
    awards?: ProjectAward[];
    members?: ProjectMemberSummary[];
}

// ─── Social / Interaction ─────────────────────────────────────────────────────

export interface StarToggleResponse {
    starred: boolean;
    stars_count: number;
}

export interface BookmarkToggleResponse {
    bookmarked: boolean;
    bookmarks_count: number;
}

export interface FollowToggleResponse {
    following: boolean;
    followers_count: number;
}

export type TrendingWindow = '24h' | '7d' | '30d';

export interface TrendingProject extends Project {
    owner: ProjectOwner;
    category: ProjectCategory | null;
}

// ─── Search Facets ────────────────────────────────────────────────────────────

export interface SearchFacetCategory {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
}

export interface SearchFacetTechnology {
    id: string;
    name: string;
    slug: string;
    type: string | null;
    color: string | null;
    icon_url: string | null;
}

export interface SearchFacetCompetition {
    id: string;
    name: string;
    slug: string;
    academic_year: number | null;
    level: string | null;
}

export interface SearchFacets {
    categories: SearchFacetCategory[];
    technologies: SearchFacetTechnology[];
    competitions: SearchFacetCompetition[];
    departments: string[];
    years: number[];
}

export interface SearchFilters {
    search?: string;
    student_name?: string;
    supervisor?: string;
    technology_id?: string;
    technology_name?: string;
    competition_id?: string;
    competition_name?: string;
    category_id?: string;
    category_name?: string;
    award_name?: string;
    award_rank?: string;
    academic_year?: string;
    department?: string;
    winning_only?: boolean | string;
    featured_only?: boolean | string;
    sort?: string;
    direction?: string;
}

// ─── Credits Domain ───────────────────────────────────────────────────────────

export type CreditsCategory =
    | 'development_team'
    | 'faculty_supervisors'
    | 'contributors'
    | 'sponsors';

export type CreditsType =
    | 'developer'
    | 'designer'
    | 'supervisor'
    | 'advisor'
    | 'contributor'
    | 'alumni';

export interface CreditsMember {
    id: string;
    user_id:           number | null;
    name:              string;
    name_en:           string;
    name_ar:           string | null;
    title:             string;
    title_en:          string;
    title_ar:          string | null;
    bio:               string | null;
    bio_en:            string | null;
    bio_ar:            string | null;
    avatar:            string | null;
    email:             string | null;
    linkedin_url:      string | null;
    github_url:        string | null;
    website_url:       string | null;
    type:              CreditsType;
    category:          CreditsCategory;
    contribution_year: number | null;
    is_active:         boolean;
    is_featured:       boolean;
    sort_order:        number;
    created_at:        string;
    updated_at:        string;
}

export interface CreditsStats {
    total:               number;
    active:              number;
    featured:            number;
    development_team:    number;
    faculty_supervisors: number;
    contributors:        number;
    sponsors:            number;
}

// ─── Core Domain Types ────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'admin' | 'student';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type Locale = 'en' | 'ar';

export interface AuthUser {
    id: number;
    name: string;
    username: string | null;
    email: string;
    avatar: string | null;
    status: UserStatus;
    locale: Locale;
    role: UserRole | null;
}

export interface UserProfile {
    id: number;
    user_id: number;
    student_id: string | null;
    phone: string | null;
    gender: 'male' | 'female' | null;
    birth_date: string | null;
    department: string | null;
    enrollment_year: number | null;
    graduation_year: number | null;
    academic_level: string | null;
    bio: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    website_url: string | null;
    skills: string[] | null;
}

// ─── Notification Domain ──────────────────────────────────────────────────────

export type NotificationCategory =
    | 'project' | 'review' | 'member' | 'award'
    | 'competition' | 'system' | 'account';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AppNotification {
    id: string;
    category: NotificationCategory;
    title: string;
    title_ar: string;
    body: string | null;
    body_ar: string | null;
    action_url: string | null;
    icon: string;
    color: string;
    priority: NotificationPriority;
    project_id: string | null;
    read_at: string | null;
    created_at: string;
}

// ─── SEO Meta (passed per-page from controllers) ──────────────────────────────

export interface SeoMeta {
    title: string;
    site_name?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    robots?: string;
    locale?: string;
    og?: {
        title?: string;
        description?: string;
        image?: string;
        image_alt?: string;
        url?: string;
        type?: string;
        site_name?: string;
        locale?: string;
    };
    twitter?: {
        card?: string;
        site?: string;
        title?: string;
        description?: string;
        image?: string;
        image_alt?: string;
    };
    schema?: Record<string, unknown> | null;
}

// ─── Inertia Shared Props ─────────────────────────────────────────────────────

export interface SharedProps {
    auth: {
        user: AuthUser | null;
        permissions: string[];
    };
    locale: Locale;
    flash: {
        success: string | null;
        error: string | null;
        warning: string | null;
        info: string | null;
    };
    ziggy: {
        url: string;
        port: number | null;
        defaults: Record<string, unknown>;
        routes: Record<string, unknown>;
        location: string;
    };
    site: Record<string, string | number | boolean | null>;
    seo: SeoMeta;
    notifications: {
        unread_count: number;
    } | null;
}

// ─── Site Settings Groups ─────────────────────────────────────────────────────

export interface GeneralSettings {
    site_name: string;
    site_tagline: string;
    site_description: string;
    maintenance_mode: boolean;
    registration_open: boolean;
    guest_view: boolean;
    require_approval: boolean;
    session_timeout: number;
    max_upload_mb: number;
}

export interface BrandingSettings {
    site_logo: string;
    site_favicon: string;
    primary_color: string;
    accent_color: string;
}

export interface SeoSettings {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_title: string;
    og_description: string;
    og_image_url: string;
    twitter_card: string;
    twitter_site: string;
    canonical_url: string;
    robots: string;
    google_analytics: string;
    google_tag_manager: string;
}

export interface ContactSettings {
    contact_email: string;
    support_email: string;
    contact_phone: string;
    contact_address: string;
    contact_city: string;
    contact_country: string;
    maps_embed_url: string;
}

export interface SocialSettings {
    social_twitter: string;
    social_linkedin: string;
    social_github: string;
    social_instagram: string;
    social_youtube: string;
    social_facebook: string;
}

export interface FooterLink {
    label: string;
    url: string;
    target: '_self' | '_blank';
}

export interface FooterSettings {
    footer_tagline: string;
    footer_copyright: string;
    footer_show_socials: boolean;
    footer_show_links: boolean;
    footer_links: FooterLink[];
}

export interface AllSettings {
    general: GeneralSettings;
    branding: BrandingSettings;
    seo: SeoSettings;
    contact: ContactSettings;
    social: SocialSettings;
    footer: FooterSettings;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status: number;
}

// ─── Form Errors ──────────────────────────────────────────────────────────────

export type FormErrors<T extends object> = Partial<Record<keyof T, string>>;

// ─── Repository Explorer ──────────────────────────────────────────────────────

export type RepositoryStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface FileTreeNode {
    type: 'file' | 'directory';
    name: string;
    path: string;
    size?: number;
    extension?: string;
    language?: string;
    children?: FileTreeNode[];
}

// ─── Analytics types ──────────────────────────────────────────────────────────

export interface LanguageStat {
    name: string;
    files: number;
    lines: number;
    bytes: number;
    percentage: number;
    color: string;
}

export interface FrameworkDetection {
    name: string;
    language: string;
}

export interface LibraryDetection {
    name: string;
    language: string;
}

export interface FileTypeStat {
    extension: string;
    count: number;
    bytes: number;
}

export interface TopFile {
    path: string;
    lines: number;
    bytes: number;
    language: string;
}

export interface RepositoryAnalytics {
    total_files: number;
    total_lines: number;
    code_lines: number;
    comment_lines: number;
    blank_lines: number;
    total_bytes: number;
    total_size: string;
    avg_file_size_kb: number;
    max_file_lines: number;
    primary_language: string | null;
    languages: LanguageStat[];
    frameworks: FrameworkDetection[];
    libraries: LibraryDetection[];
    file_types: FileTypeStat[];
    top_files: TopFile[];
    analysed_at: string;
}

export interface RepositoryUpload {
    id: string;
    name: string;
    original_filename: string;
    status: RepositoryStatus;
    file_count: number;
    size_for_humans: string;
    file_tree: FileTreeNode[];
    created_at: string;
    error_message: string | null;
    has_analytics: boolean;
    analytics: RepositoryAnalytics | null;
}

export interface FileContent {
    content: string | null;
    too_large: boolean;
    size: number;
    extension: string;
    is_text: boolean;
    language?: string;
}

export interface SearchResult {
    type: 'file' | 'directory';
    name: string;
    path: string;
    extension: string | null;
    language: string | null;
}

// ─── Competition Domain ───────────────────────────────────────────────────────

export type CompetitionStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type CompetitionLevel  = 'university' | 'national' | 'regional' | 'international';
export type SubmissionStatus  = 'submitted' | 'shortlisted' | 'finalist' | 'winner' | 'disqualified' | 'withdrawn';
export type AwardRank         = 'first' | 'second' | 'third' | 'honorable_mention' | 'finalist' | 'special';

export interface CompetitionCreator {
    id: number;
    name: string;
}

export interface Competition {
    id: string;
    name: string;
    name_ar: string | null;
    slug: string;
    description: string | null;
    description_ar: string | null;
    organizer: string | null;
    organizer_logo: string | null;
    website_url: string | null;
    cover_image: string | null;
    level: CompetitionLevel;
    status: CompetitionStatus;
    start_date: string | null;
    end_date: string | null;
    academic_year: number | null;
    is_featured: boolean;
    sort_order: number;
    projects_count: number;
    creator: CompetitionCreator | null;
    created_at: string;
}

export interface CompetitionStats {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
    total_projects: number;
}

export interface CompetitionProjectEntry {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    department: string | null;
    academic_year: number | null;
    owner: { id: number; name: string } | null;
    category: { id: string; name: string; color: string | null } | null;
    submission_status: SubmissionStatus;
    award_rank: AwardRank | null;
    submission_number: number | null;
    submission_notes: string | null;
    submitted_at: string | null;
}

// ─── Award Domain ─────────────────────────────────────────────────────────────

export interface Award {
    id: string;
    title: string;
    title_ar: string | null;
    issuer: string | null;
    rank: AwardRank | null;
    awarded_at: string | null;
    academic_year: number | null;
    notes: string | null;
    is_verified: boolean;
    project: {
        id: string;
        title: string;
        slug: string;
        thumbnail: string | null;
        category: { id: string; name: string; color: string | null } | null;
    } | null;
    competition: {
        id: string;
        name: string;
        name_ar: string | null;
        academic_year: number | null;
    } | null;
    verifier: { id: number; name: string } | null;
    created_at: string;
}

export interface AwardStats {
    total: number;
    verified: number;
    first: number;
    second: number;
    third: number;
    special: number;
}

// ─── Hall of Fame Domain ──────────────────────────────────────────────────────

export interface HofTopProject {
    id: string;
    rank: number;
    title: string;
    title_ar: string | null;
    slug: string;
    thumbnail: string | null;
    category: string | null;
    category_ar: string | null;
    department: string | null;
    academic_year: number | null;
    views_count: number;
    stars_count: number;
    awards_count: number;
    hof_score: number;
    tags: string[];
}

export interface HofTopStudent {
    id: number;
    rank: number;
    name: string;
    avatar: string | null;
    university: string | null;
    department: string | null;
    graduation_year: number | null;
    total_points: number;
    projects_count: number;
    awards_count: number;
    stars_count: number;
    views_count: number;
    top_skills: string[];
}

export interface HofAward {
    id: string;
    title: string;
    title_ar: string | null;
    issuer: string | null;
    rank: AwardRank | null;
    awarded_at: string | null;
    academic_year: number | null;
    is_verified: boolean;
    project_title: string | null;
    project_slug: string | null;
    competition_name: string | null;
}

export interface HofStats {
    projects_judged: number;
    students_competed: number;
    total_awards: number;
    competitions_held: number;
}
