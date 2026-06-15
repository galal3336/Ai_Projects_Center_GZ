import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface Props {
    status?: string;
}

export default function ForgotPassword({ status }: Props) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/forgot-password');
    }

    return (
        <>
            <Head title="Forgot Password" />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Forgot your password?</h1>
                    <p className="text-gray-600 text-sm mb-6">
                        Enter your email and we'll send you a password reset link.
                    </p>
                    {status && <p className="text-green-600 text-sm mb-4">{status}</p>}
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                                autoComplete="email"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            Send Reset Link
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
