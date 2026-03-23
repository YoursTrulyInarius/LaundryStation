import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, User, Receipt, Search, Clock, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Trash({ apiBaseUrl }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTrash = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiBaseUrl}/trash.php?type=${filter}`);
            const data = await res.json();
            setItems(data);
            setError(null);
        } catch (err) {
            setError('Failed to load trash items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, [filter]);

    const handleRestore = async (id, type) => {
        try {
            const res = await fetch(`${apiBaseUrl}/trash.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type })
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire({
                    title: 'Restored',
                    text: 'The record has been returned to the main list.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    borderRadius: '1.5rem'
                });
                fetchTrash();
            } else {
                Swal.fire('Error', data.error || 'Restore failed', 'error');
            }
        } catch (err) {
            console.error('Restore failed:', err);
        }
    };

    const handleDeleteForever = async (id, type) => {
        const result = await Swal.fire({
            title: 'Delete Forever?',
            text: "This action is permanent and cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete Permanently',
            confirmButtonColor: '#EF4444',
            cancelButtonText: 'Cancel',
            borderRadius: '1.5rem',
            customClass: {
                popup: 'rounded-3xl border-0 shadow-2xl',
                confirmButton: 'rounded-xl font-bold px-6 py-3',
                cancelButton: 'rounded-xl font-bold px-6 py-3 !text-gray-500'
            }
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${apiBaseUrl}/trash.php?id=${id}&type=${type}`, {
                    method: 'DELETE'
                });
                const data = await res.json();
                if (data.success) {
                    Swal.fire({
                        title: 'Deleted',
                        text: 'The record has been erased forever.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        borderRadius: '1.5rem'
                    });
                    fetchTrash();
                } else {
                    Swal.fire('Error', data.error || 'Deletion failed', 'error');
                }
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
    };

    const getDaysRemaining = (deletedAt) => {
        const deletedDate = new Date(deletedAt);
        const now = new Date();
        const diffTime = now - deletedDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const remaining = 30 - diffDays;
        return remaining > 0 ? remaining : 0;
    };

    const filteredItems = items.filter(item => {
        const name = item.type === 'customer' ? item.Name : item.CustomerName;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading && items.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Trash2 className="text-red-500" /> Trash Repository
                    </h2>
                    <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        30-Day Auto-Cleanup
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search deleted records..."
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-3 rounded-2xl font-bold transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-gray-500 border border-gray-100'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('customer')}
                            className={`flex-1 py-3 rounded-2xl font-bold transition-all ${filter === 'customer' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-gray-500 border border-gray-100'}`}
                        >
                            Customers
                        </button>
                        <button
                            onClick={() => setFilter('transaction')}
                            className={`flex-1 py-3 rounded-2xl font-bold transition-all ${filter === 'transaction' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-gray-500 border border-gray-100'}`}
                        >
                            Orders
                        </button>
                    </div>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-gray-500 font-medium">No deleted items found</h3>
                    <p className="text-gray-400 text-sm mt-1">Deleted records will appear here for restoration.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredItems.map((item) => {
                        const daysLeft = getDaysRemaining(item.deleted_at);
                        return (
                            <div key={`${item.type}-${item.CustomerID || item.TransactionID}`} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.type === 'customer' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                        {item.type === 'customer' ? <User size={28} /> : <Receipt size={28} />}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-800 text-lg leading-tight">{item.type === 'customer' ? item.Name : item.CustomerName}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            <p className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded uppercase font-black tracking-widest border border-gray-100">
                                                {item.type}
                                            </p>
                                            <p className="text-[10px] text-red-500 font-black flex items-center gap-1 uppercase tracking-wider">
                                                <Clock size={12} /> {daysLeft} days remaining
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleRestore(item.CustomerID || item.TransactionID, item.type)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                                    >
                                        <RotateCcw size={16} /> Restore
                                    </button>
                                    <button
                                        onClick={() => handleDeleteForever(item.CustomerID || item.TransactionID, item.type)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-red-50 text-red-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                                    >
                                        <XCircle size={16} /> Erase
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
