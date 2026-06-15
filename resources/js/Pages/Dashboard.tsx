import { Head } from '@inertiajs/react';

interface Props {
    auth: {
        user: { name: string; email: string };
    };
}

export default function Dashboard({ auth }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <div className="max-w-4xl w-full px-6 py-12 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome back, {auth.user.name}!
                    </h1>
                    <p className="text-gray-600">You're logged in.</p>
                </div>
            </div>
        </>
    );
}
