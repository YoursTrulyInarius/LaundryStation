import { useState, useEffect } from 'react';
import { BarChart3, CalendarDays, Calendar, CalendarClock, Download, FileType2, AlertTriangle } from 'lucide-react';

export default function Reports({ apiBaseUrl }) {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleDownload = (period) => {
        window.open(`${apiBaseUrl}/export_csv.php?period=${period}`, '_blank');
    };

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`${apiBaseUrl}/reports.php`)
            .then(res => {
                if (!res.ok) throw new Error(`Server responded with ${res.status}`);
                return res.json();
            })
            .then(data => {
                setReports(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch reports", err);
                setError(err.message || "Failed to load reports. Please check your database connection.");
                setLoading(false);
            });
    }, [apiBaseUrl]);

    if (loading) {
        return <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-gray-400 font-medium">Crunching the numbers...</p>
        </div>;
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center space-y-3 animate-fade-in my-10">
                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="font-bold text-red-900">Unable to Load Reports</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-200 shadow-sm"
                >
                    Try Refreshing
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Financial Reports</h2>
                    <p className="text-sm text-gray-500">Sales summary breakdown.</p>
                </div>
            </div>

            <div className="space-y-4">
                <ReportCard
                    title="Weekly Sales"
                    subtitle="Last 7 Days"
                    value={reports?.weekly_sales}
                    icon={<CalendarDays size={20} className="text-indigo-600" />}
                />
                <ReportCard
                    title="Monthly Sales"
                    subtitle="Current Month"
                    value={reports?.monthly_sales}
                    icon={<Calendar size={20} className="text-indigo-600" />}
                />
                <ReportCard
                    title="Annual Sales"
                    subtitle="Current Year"
                    value={reports?.annual_sales}
                    icon={<CalendarClock size={20} className="text-indigo-600" />}
                />
            </div>

            {/* CSV Export Section */}
            <div className="mt-8 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-3">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                        <FileType2 size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Export Data</h3>
                        <p className="text-xs text-gray-500">Download historical transactions as CSV.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleDownload('weekly')}
                        className="w-full flex items-center justify-between px-4 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 py-3 rounded-xl font-bold transition-colors text-sm"
                    >
                        <span>Weekly Report</span>
                        <Download size={18} className="text-indigo-600" />
                    </button>

                    <button
                        onClick={() => handleDownload('monthly')}
                        className="w-full flex items-center justify-between px-4 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 py-3 rounded-xl font-bold transition-colors text-sm"
                    >
                        <span>Monthly Report</span>
                        <Download size={18} className="text-indigo-600" />
                    </button>

                    <button
                        onClick={() => handleDownload('annual')}
                        className="w-full flex items-center justify-between px-4 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 py-3 rounded-xl font-bold transition-colors text-sm"
                    >
                        <span>Annual Report</span>
                        <Download size={18} className="text-indigo-600" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ReportCard({ title, subtitle, value, icon }) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-indigo-100 transition-colors">
            <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-full">
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xl font-bold text-emerald-600">₱{parseFloat(value || 0).toFixed(2)}</p>
            </div>
        </div>
    );
}
