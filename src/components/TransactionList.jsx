import { useState, useEffect } from 'react';
import { FileText, Calendar, Download } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TransactionList({ apiBaseUrl, onPrint }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${apiBaseUrl}/transactions.php`)
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            });
    }, [apiBaseUrl]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Ready':
            case 'Ready for Pickup': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Washing':
            case 'Drying':
            case 'Folding': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Received': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPaymentColor = (status) => {
        if (status === 'Approved' || status === 'Paid') {
            return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        }
        return 'bg-amber-50 text-amber-600 border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors';
    };

    const handleUpdateStatus = (transactionId, newStatus, customerName) => {
        Swal.fire({
            title: 'Confirm Approval',
            text: `Mark ${customerName}'s order (#${transactionId}) as ${newStatus}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Approve',
            borderRadius: '1.5rem',
            width: '320px',
            customClass: {
                popup: 'rounded-3xl border-0 shadow-2xl',
                title: 'text-indigo-900 font-bold text-lg',
                htmlContainer: 'text-gray-500 font-medium text-sm',
                confirmButton: 'rounded-xl font-bold px-6 py-2 text-sm',
                cancelButton: 'rounded-xl font-bold px-6 py-2 text-sm'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${apiBaseUrl}/transactions.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        TransactionID: transactionId,
                        PaymentStatus: newStatus
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setTransactions(transactions.map(t =>
                                t.TransactionID === transactionId ? { ...t, PaymentStatus: newStatus } : t
                            ));
                            Swal.fire({
                                title: 'Success',
                                text: 'Payment has been approved.',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false,
                                borderRadius: '1.5rem'
                            });
                        } else {
                            Swal.fire('Error', data.error || 'Update failed', 'error');
                        }
                    });
            }
        });
    };

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

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full"></div></div>;

    return (
        <div className="animate-fade-in space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Orders</h2>

            <div className="space-y-3 pb-6">
                {transactions.length > 0 ? (
                    transactions.map(t => (
                        <div key={t.TransactionID} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                                    <FileText size={16} className="text-indigo-400" />
                                    TXN #{t.TransactionID}
                                </div>
                                <button
                                    onClick={() => {
                                        fetch(`${apiBaseUrl}/transactions.php?id=${t.TransactionID}`)
                                            .then(res => res.json())
                                            .then(fullTxn => onPrint(fullTxn));
                                    }}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-transparent hover:border-indigo-100"
                                    title="Download/Print Receipt"
                                >
                                    <Download size={14} /> Receipt
                                </button>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${getStatusColor(t.LaundryStatus)}`}>
                                    {t.LaundryStatus}
                                </span>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-bold text-gray-900 text-base">{t.CustomerName}</h3>
                                <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> In: {formatLongDate(t.TransactionDate)}</span>
                                    {t.PickupDate && (
                                        <span className="flex items-center gap-1 text-indigo-600 font-medium">
                                            <Calendar size={12} /> Pickup: {formatLongDate(t.PickupDate)}, {formatTime(t.PickupTime)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                                {t.PaymentStatus === 'Pending' ? (
                                    <button
                                        onClick={() => handleUpdateStatus(t.TransactionID, 'Approved', t.CustomerName)}
                                        className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getPaymentColor(t.PaymentStatus)}`}
                                        title="Click to Approve Payment"
                                    >
                                        {t.PaymentStatus}
                                    </button>
                                ) : (
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getPaymentColor(t.PaymentStatus)}`}>
                                        {t.PaymentStatus}
                                    </span>
                                )}
                                <span className="font-bold text-lg text-emerald-600">₱{parseFloat(t.TotalAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500 text-sm bg-white rounded-xl border border-dashed border-gray-200">No orders found.</div>
                )}
            </div>
        </div>
    );
}
