import '../css/app.css';
import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { I18nProvider } from '@/i18n';

const appName = import.meta.env.VITE_APP_NAME || 'AiKFS';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx');
        const importer = pages[`./Pages/${name}.tsx`];
        if (!importer) throw new Error(`Page not found: ${name}`);

        // Wrap every page in I18nProvider. The page renders inside <App> which
        // establishes Inertia's context, so usePage() is available here.
        const PageModule = lazy(importer as () => Promise<{ default: React.ComponentType<any> }>);
        function WrappedPage(props: any) {
            return (
                <I18nProvider>
                    <PageModule {...props} />
                </I18nProvider>
            );
        }
        return WrappedPage;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <Suspense fallback={null}>
                <App {...props} />
            </Suspense>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
