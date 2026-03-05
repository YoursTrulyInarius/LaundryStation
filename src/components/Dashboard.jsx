import { useState, useEffect } from 'react';
import { Package, CheckCircle2, AlertCircle, TrendingUp, HandCoins, Activity, ChevronDown, AlertTriangle } from 'lucide-react';

export default function Dashboard({ apiBaseUrl, onNavigate, userRole }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showServices, setShowServices] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`${apiBaseUrl}/dashboard.php`)
            .then(res => {
                if (!res.ok) throw new Error(`Server responded with ${res.status}`);
                return res.json();
            })
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch dashboard", err);
                setError(err.message || "Connection failed.");
                setLoading(false);
            });
    }, [apiBaseUrl]);

    if (loading) {
        return <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-gray-400 font-medium">Loading Dashboard...</p>
        </div>;
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center space-y-3 animate-fade-in my-10">
                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="font-bold text-red-900">Dashboard Unavailable</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-200 shadow-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    const { summary, pending_orders } = stats || {};
    const isAdmin = userRole === 'Admin / Owner';

    const formatLongDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).replace(',', '');
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* ... other parts of dashboard ... */}
            {/* Welcome Banner */}
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-block px-2 py-0.5 bg-white/20 rounded text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-sm">
                        {isAdmin ? 'Management' : 'Operations'}
                    </div>
                    <h2 className="text-2xl font-bold mb-1">Welcome back!</h2>
                    <p className="text-indigo-100 mb-4 cursor-default">
                        {isAdmin ? "Here's your business financial summary." : "Here's today's operational summary."}
                    </p>
                    {!isAdmin && (
                        <button
                            onClick={() => onNavigate('new_transaction')}
                            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            New Order
                        </button>
                    )}
                </div>
            </div>

            {isAdmin ? (
                // ADMIN DASHBOARD ONLY
                <div className="space-y-6">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-lg font-bold text-gray-800">Sales Overview</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            icon={<HandCoins className="text-emerald-500" size={24} />}
                            title="Revenue Today"
                            value={`₱${parseFloat(summary?.total_revenue || 0).toFixed(2)}`}
                            trend="+12%"
                            bgColor="bg-emerald-50"
                        />
                        <StatCard
                            icon={<Activity className="text-indigo-600" size={24} />}
                            title="Avg Transaction"
                            value={`₱${summary?.total_transactions ? (summary.total_revenue / summary.total_transactions).toFixed(2) : '0.00'}`}
                            bgColor="bg-indigo-50"
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-4">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Package size={18} className="text-indigo-500" />
                            Total Output Data
                        </h4>
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-gray-500 text-sm">Total Transactions Processed</span>
                            <span className="font-bold text-gray-900">{summary?.total_transactions || 0}</span>
                        </div>
                        <div
                            className="flex justify-between items-center py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors"
                            onClick={() => setShowServices(!showServices)}
                        >
                            <span className="text-gray-500 text-sm">Services Active</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{stats?.services?.length || 0} Categories</span>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showServices ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                        {showServices && stats?.services && (
                            <div className="bg-gray-50 rounded-lg p-3 mt-2 text-sm text-gray-700 space-y-2 border border-gray-100 animate-fade-in">
                                {stats.services.map((service, idx) => (
                                    <div key={idx} className="flex items-center gap-2 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        {service}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // STAFF DASHBOARD ONLY
                <>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Operational Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                icon={<Package className="text-indigo-600" size={24} />}
                                title="Orders Taken"
                                value={summary?.total_transactions || 0}
                                bgColor="bg-indigo-50"
                            />
                            <StatCard
                                icon={<AlertCircle className="text-emerald-600" size={24} />}
                                title="To Pickup"
                                value={pending_orders?.length || 0}
                                bgColor="bg-emerald-50"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Waitlist</h3>
                                <p className="text-xs text-gray-500 font-medium italic">Pending Pickups</p>
                            </div>
                            <button
                                onClick={() => onNavigate('transactions')}
                                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {pending_orders?.length > 0 ? (
                                pending_orders.map(order => (
                                    <div key={order.TransactionID} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2.5 rounded-xl shadow-xs text-indigo-600 border border-gray-100">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{order.CustomerName}</h4>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">TXN #{order.TransactionID}</span>
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{order.LaundryStatus}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-900 flex items-center justify-end gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                {formatTime(order.PickupTime)}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5 whitespace-nowrap">
                                                {formatLongDate(order.PickupDate)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm font-medium italic">No pending pickups for today.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )
            }
        </div >
    );
}

function StatCard({ icon, title, value, trend, bgColor }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl ${bgColor}`}>
                {icon}
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1 mt-6">{title}</p>
            <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
                {trend && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        <TrendingUp size={10} className="mr-0.5" />
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}
