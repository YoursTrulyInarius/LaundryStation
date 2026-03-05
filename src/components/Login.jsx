import { useState } from 'react';
import { Lock, User } from 'lucide-react';

export default function Login({ apiBaseUrl, onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        fetch(`${apiBaseUrl}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                if (data.success) {
                    onLogin(data.user);
                } else {
                    setError(data.error || 'Invalid credentials');
                }
            })
            .catch(() => {
                setLoading(false);
                setError('Connection failed. Is the API running?');
            });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 items-center justify-center p-6 animate-fade-in relative overflow-hidden w-full">
            <div className="w-full max-w-sm z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-600 text-white text-4xl shadow-xl mb-4">
                        🧺
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">DingDong's</h1>
                    <p className="text-indigo-600 font-medium tracking-wide pb-2">Laundry Station</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="admin or staff"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-gray-100 border border-gray-200 text-gray-800 text-sm rounded-lg font-medium text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>Test Accounts:</p>
                    <p className="mt-1">Admin: <span className="font-mono text-gray-600 bg-gray-100 px-1 rounded">admin</span> | Staff: <span className="font-mono text-gray-600 bg-gray-100 px-1 rounded">staff</span></p>
                </div>
            </div>
        </div>
    );
}
