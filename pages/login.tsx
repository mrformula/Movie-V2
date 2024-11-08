import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

export default function Login() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await res.json();

            if (res.ok) {
                // Save user data in session storage
                sessionStorage.setItem('user', JSON.stringify(data.user));
                sessionStorage.setItem('isLoggedIn', 'true');

                toast.success('Login successful');
                router.push('/admin');
            } else {
                toast.error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Error logging in');
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center">
            <div className="bg-secondary p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Login to Dashboard</h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-gray-300 text-sm">Username</label>
                        <input
                            type="text"
                            className="w-full bg-primary text-white p-3 rounded mt-1"
                            value={credentials.username}
                            onChange={(e) => setCredentials({
                                ...credentials,
                                username: e.target.value
                            })}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-gray-300 text-sm">Password</label>
                        <input
                            type="password"
                            className="w-full bg-primary text-white p-3 rounded mt-1"
                            value={credentials.password}
                            onChange={(e) => setCredentials({
                                ...credentials,
                                password: e.target.value
                            })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-medium"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
} 