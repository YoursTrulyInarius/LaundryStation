import { useState, useEffect } from 'react';
import { Search, UserPlus, Phone, MapPin, ChevronRight, User, X, Loader2, Edit3, Trash2, Mail } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CustomerList({ apiBaseUrl }) {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        CustomerID: '',
        Name: '',
        ContactNumber: '',
        Address: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, [search]);

    const fetchCustomers = () => {
        const url = search
            ? `${apiBaseUrl}/customers.php?search=${encodeURIComponent(search)}`
            : `${apiBaseUrl}/customers.php`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setCustomers(data);
                setLoading(false);
            });
    };

    const handleSaveCustomer = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const method = editingCustomer ? 'PUT' : 'POST';
        const url = `${apiBaseUrl}/customers.php`;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setShowAddForm(false);
                    setEditingCustomer(null);
                    setFormData({ CustomerID: '', Name: '', ContactNumber: '', Address: '' });
                    fetchCustomers();
                }
                setSubmitting(false);
            })
            .catch(err => {
                console.error("Save error:", err);
                setSubmitting(false);
            });
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            CustomerID: customer.CustomerID,
            Name: customer.Name,
            ContactNumber: customer.ContactNumber || '',
            Address: customer.Address || ''
        });
        setShowDetailModal(false);
        setShowAddForm(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete Profile?',
            text: "This action is permanent and cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'No, Keep',
            confirmButtonColor: '#4F46E5',
            cancelButtonColor: '#F3F4F6',
            borderRadius: '1.5rem',
            customClass: {
                popup: 'rounded-3xl border-0 shadow-2xl',
                title: 'text-indigo-900 font-bold',
                htmlContainer: 'text-gray-500 font-medium',
                confirmButton: 'rounded-xl font-bold px-6 py-3',
                cancelButton: 'rounded-xl font-bold px-6 py-3 !text-gray-500'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${apiBaseUrl}/customers.php?id=${id}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                title: 'Success',
                                text: 'Profile has been removed.',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false,
                                borderRadius: '1.5rem',
                                width: '320px',
                                customClass: {
                                    popup: 'rounded-3xl border-0 shadow-2xl',
                                    title: 'text-indigo-900 font-bold text-lg'
                                }
                            });
                            setShowDetailModal(false);
                            fetchCustomers();
                            if (onNavigate) onNavigate('trash');
                        }
                    })
                    .catch(err => console.error("Delete error:", err));
            }
        });
    };

    const handleViewDetail = (customer) => {
        setSelectedCustomer(customer);
        setShowDetailModal(true);
    };

    return (
        <>
            <div className="animate-fade-in space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-800">Customers</h2>
                    <button
                        onClick={() => {
                            setEditingCustomer(null);
                            setFormData({ CustomerID: '', Name: '', ContactNumber: '', Address: '' });
                            setShowAddForm(true);
                        }}
                        className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
                    >
                        <UserPlus size={20} />
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="space-y-3 mt-4">
                    {loading ? (
                        <div className="text-center py-4"><div className="animate-spin inline-block rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
                    ) : customers?.length > 0 ? (
                        customers.map(c => (
                            <div
                                key={c.CustomerID}
                                onClick={() => handleViewDetail(c)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all group cursor-pointer active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-lg border border-indigo-100 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        {c.Name ? c.Name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{c.Name}</h3>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                            <Phone size={12} className="text-gray-300" />
                                            <span>{c.ContactNumber}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                            <User size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 text-sm font-medium">No customers found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Customer Modal - Outside the animated container to fix stacking/positioning context */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 z-[30] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 border border-gray-100 overflow-hidden relative">
                        {/* Design Accent */}
                        <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shrink-0" />

                        {/* Modal Header */}
                        <div className="p-8 pb-6 flex justify-between items-start shrink-0">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                                    {editingCustomer ? 'Update Profile' : 'New Customer'}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                                    <p className="text-[11px] text-indigo-500 font-black uppercase tracking-[0.2em]">
                                        {editingCustomer ? 'Management' : 'Onboarding'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingCustomer(null);
                                }}
                                className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-3 rounded-2xl transition-all active:scale-95 group"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
                            <form id="customer-form" onSubmit={handleSaveCustomer} className="space-y-8 py-4">
                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">
                                        Client Full Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter complete name..."
                                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-gray-900 text-base placeholder:text-gray-300"
                                            value={formData.Name}
                                            onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">
                                        Active Mobile Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            placeholder="09123456789"
                                            maxLength={11}
                                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-gray-900 text-base placeholder:text-gray-300"
                                            value={formData.ContactNumber}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                                setFormData({ ...formData, ContactNumber: val });
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">
                                        Service Address
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            required
                                            placeholder="Complete street & landmark details..."
                                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-indigo-600 focus:bg-white transition-all outline-none min-h-[120px] font-bold text-gray-900 text-base resize-none placeholder:text-gray-300"
                                            value={formData.Address}
                                            onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer (Fixed) */}
                        <div className="p-8 pt-4 bg-white shrink-0">
                            <button
                                form="customer-form"
                                disabled={submitting}
                                type="submit"
                                className={`w-full ${editingCustomer ? 'bg-black hover:bg-gray-900' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl ${editingCustomer ? 'shadow-gray-200' : 'shadow-indigo-200'} flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] transition-all group`}
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingCustomer ? <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /> : <UserPlus size={18} className="group-hover:scale-110 transition-transform" />)}
                                {submitting ? 'PROCESSING...' : (editingCustomer ? 'SAVE UPDATES' : 'FINALIZE REGISTRATION')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Detail View Modal */}
            {showDetailModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 z-[40] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.2)] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
                        {/* Profile Header */}
                        <div className="relative h-32 bg-indigo-600 shrink-0">
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-24 w-24 rounded-2xl bg-white p-2 shadow-xl">
                                <div className="h-full w-full rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black text-3xl border border-indigo-100">
                                    {selectedCustomer.Name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 p-2 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div className="pt-14 pb-8 px-8 flex flex-col items-center text-center">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedCustomer.Name}</h3>
                            <p className="text-xs text-indigo-500 font-black uppercase tracking-widest mt-1">Value Customer</p>

                            <div className="w-full mt-8 space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-indigo-100 transition-colors">
                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                        <Phone size={18} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</p>
                                        <p className="text-sm font-bold text-gray-900">{selectedCustomer.ContactNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-indigo-100 transition-colors">
                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                        <MapPin size={18} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Address</p>
                                        <p className="text-sm font-bold text-gray-900 leading-relaxed">{selectedCustomer.Address || 'No address specified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="p-8 pt-0 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleEdit(selectedCustomer)}
                                className="flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
                            >
                                <Edit3 size={16} />
                                Edit Info
                            </button>
                            <button
                                onClick={() => {
                                    handleDelete(selectedCustomer.CustomerID);
                                }}
                                className="flex items-center justify-center gap-2 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
