import { useState, useEffect } from 'react';
import { Plus, Minus, Search, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2, Edit2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TransactionForm({ apiBaseUrl, onComplete, onPrint }) {
    const [customers, setCustomers] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [step, setStep] = useState(1); // 1: Customer, 2: Services, 3: Summary
    const [loading, setLoading] = useState(true);
    const [pickupDate, setPickupDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    });
    const [pickupTime, setPickupTime] = useState('12:00');

    // Fetch initial data
    useEffect(() => {
        Promise.all([
            fetch(`${apiBaseUrl}/customers.php`).then(res => res.json()),
            fetch(`${apiBaseUrl}/services.php`).then(res => res.json())
        ]).then(([custData, servData]) => {
            setCustomers(custData);
            setServices(servData);
            setLoading(false);
        });
    }, [apiBaseUrl]);

    const addService = (service) => {
        const existing = selectedServices.find(s => s.ServiceID === service.ServiceID);
        let nextServices;
        if (existing) {
            nextServices = selectedServices.map(s =>
                s.ServiceID === service.ServiceID ? { ...s, Quantity: parseFloat(s.Quantity) + 1 } : s
            );
        } else {
            nextServices = [...selectedServices, { ...service, Quantity: 1 }];
        }

        const totalWeight = nextServices.reduce((sum, item) => sum + (parseFloat(item.Quantity) || 0), 0);
        if (totalWeight > 10) {
            Swal.fire({
                title: 'Limit Exceeded',
                text: 'Laundry weight should not surpass 10KG',
                icon: 'warning',
                confirmButtonColor: '#4F46E5',
                borderRadius: '1.5rem',
                width: '320px',
                customClass: {
                    popup: 'rounded-3xl border-0 shadow-2xl',
                    title: 'text-indigo-900 font-bold text-lg',
                    htmlContainer: 'text-gray-500 font-medium text-sm',
                    confirmButton: 'rounded-xl font-bold px-6 py-2 text-sm'
                }
            });
            return;
        }
        setSelectedServices(nextServices);
    };

    const updateQuantity = (id, value) => {
        // Prepare a clean value for the state that allows typing decimals
        const cleanValue = typeof value === 'string'
            ? value.replace(/[^\d.]/g, '') // Allow only digits and dots
            : value;

        const nextServices = selectedServices.map(s => {
            if (s.ServiceID === id) {
                return { ...s, Quantity: cleanValue };
            }
            return s;
        });

        const totalWeight = nextServices.reduce((sum, item) => sum + (parseFloat(item.Quantity) || 0), 0);
        if (totalWeight > 10) {
            Swal.fire({
                title: 'Limit Exceeded',
                text: 'Laundry weight should not surpass 10KG',
                icon: 'warning',
                confirmButtonColor: '#4F46E5',
                borderRadius: '1.5rem',
                width: '320px',
                customClass: {
                    popup: 'rounded-3xl border-0 shadow-2xl',
                    title: 'text-indigo-900 font-bold text-lg',
                    htmlContainer: 'text-gray-500 font-medium text-sm',
                    confirmButton: 'rounded-xl font-bold px-6 py-2 text-sm'
                }
            });
            return;
        }
        setSelectedServices(nextServices);
    };

    const removeService = (id) => {
        setSelectedServices(selectedServices.filter(s => s.ServiceID !== id));
    };

    const totalAmount = selectedServices.reduce((sum, item) => sum + (item.Price * (parseFloat(item.Quantity) || 0)), 0);
    const totalWeight = selectedServices.reduce((sum, item) => sum + (parseFloat(item.Quantity) || 0), 0);

    const handleSubmit = () => {
        if (totalWeight > 10) {
            Swal.fire({
                title: 'Limit Exceeded',
                text: 'Laundry weight should not surpass 10KG',
                icon: 'warning',
                confirmButtonColor: '#4F46E5',
                borderRadius: '1.5rem',
                width: '320px',
                customClass: {
                    popup: 'rounded-3xl border-0 shadow-2xl',
                    title: 'text-indigo-900 font-bold text-lg',
                    htmlContainer: 'text-gray-500 font-medium text-sm',
                    confirmButton: 'rounded-xl font-bold px-6 py-2 text-sm'
                }
            });
            return;
        }
        // Determine tomorrow's date for pickup
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const items = selectedServices.map(s => ({
            ServiceID: s.ServiceID,
            Quantity: parseFloat(s.Quantity) || 0,
            Subtotal: s.Price * (parseFloat(s.Quantity) || 0)
        }));

        const payload = {
            CustomerID: selectedCustomer.CustomerID,
            items: items,
            PickupDate: pickupDate,
            PickupTime: pickupTime + ':00'
        };

        fetch(`${apiBaseUrl}/transactions.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Fetch full transaction details for the receipt
                    fetch(`${apiBaseUrl}/transactions.php?id=${data.TransactionID}`)
                        .then(res => res.json())
                        .then(fullTxn => {
                            if (onPrint) onPrint(fullTxn);
                            onComplete();
                        });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.error || 'Failed to create transaction',
                        icon: 'error',
                        confirmButtonColor: '#4F46E5',
                        borderRadius: '1.5rem',
                        width: '320px',
                        customClass: {
                            popup: 'rounded-3xl border-0 shadow-2xl',
                            title: 'text-indigo-900 font-bold text-lg',
                            htmlContainer: 'text-gray-500 font-medium text-sm',
                            confirmButton: 'rounded-xl font-bold px-6 py-2 text-sm'
                        }
                    });
                }
            });
    };

    if (loading) return <div className="flex justify-center items-center h-full pt-20"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full"></div></div>;

    return (
        <div className="animate-fade-in pb-20">
            {/* Progress Steps */}
            <div className="flex justify-between mb-6 relative px-4 mt-2">
                <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-200'}`}>
                        {i}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Select Customer</h2>

                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                    </div>

                    <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-10">
                        {customers.map(c => (
                            <div
                                key={c.CustomerID}
                                onClick={() => { setSelectedCustomer(c); setStep(2); }}
                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer hover:border-indigo-500 active:bg-indigo-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                        {c.Name ? c.Name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{c.Name}</h3>
                                        <p className="text-xs text-gray-500">{c.ContactNumber}</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-gray-300" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Add Services</h2>
                        <button 
                            onClick={() => setStep(1)} 
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-indigo-100 transition-colors"
                        >
                            <ArrowLeft size={14} strokeWidth={3} /> Back
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {services.map(s => (
                            <div
                                key={s.ServiceID}
                                onClick={() => addService(s)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2 cursor-pointer active:scale-95 transition-transform"
                            >
                                <div className="text-3xl bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center">
                                    🧺
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm mt-1">{s.ServiceName}</h4>
                                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">₱{s.Price}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedServices.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky bottom-24 z-10 animate-fade-in">
                            <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
                                <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                                    <ShoppingBag size={18} /> Selected Items
                                </h3>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-lg text-emerald-600">₱{totalAmount.toFixed(2)}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${totalWeight > 9 ? 'text-red-600 animate-pulse' : 'text-indigo-400'}`}>
                                        {totalWeight.toFixed(1)} / 10.0 KG
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 space-y-3 max-h-40 overflow-y-auto w-full box-border">
                                {selectedServices.map(item => (
                                    <div key={item.ServiceID} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-[1rem] border border-gray-100/50 group hover:border-indigo-100 transition-colors">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="font-bold text-sm text-gray-900 truncate">{item.ServiceName}</p>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">₱{item.Price} / kg</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 relative bg-white border border-gray-200 rounded-xl pl-3 pr-1 py-1.5 focus-within:border-indigo-500 transition-all shadow-sm">
                                            <input
                                                type="text"
                                                value={item.Quantity}
                                                onChange={(e) => updateQuantity(item.ServiceID, e.target.value)}
                                                className="w-12 text-right font-black text-sm text-gray-900 border-0 focus:ring-0 p-0 bg-transparent"
                                                placeholder="0.0"
                                            />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mr-2">kg</span>
                                            <button
                                                onClick={() => removeService(item.ServiceID)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove Item"
                                            >
                                                <Minus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-white border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        if (totalWeight > 10) {
                                            Swal.fire({
                                                title: 'Limit Exceeded',
                                                text: 'Laundry weight should not surpass 10KG',
                                                icon: 'warning',
                                                confirmButtonColor: '#4F46E5',
                                                borderRadius: '1.5rem',
                                                width: '320px',
                                                customClass: {
                                                    popup: 'rounded-3xl border-0 shadow-2xl',
                                                    title: 'text-indigo-900 font-bold text-lg',
                                                    htmlContainer: 'text-gray-500 font-medium text-sm',
                                                    confirmButton: 'rounded-xl font-bold px-6 py-2 text-sm'
                                                }
                                            });
                                        } else {
                                            setStep(3);
                                        }
                                    }}
                                    className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-md active:bg-indigo-700 transition-colors text-sm"
                                >
                                    Review Order
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                        <button 
                            onClick={() => setStep(2)} 
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-indigo-100 transition-colors"
                        >
                            <Edit2 size={14} strokeWidth={3} /> Edit
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Customer Info */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Customer</p>
                            <p className="font-bold text-gray-900 text-lg">{selectedCustomer?.Name}</p>
                            <p className="text-sm text-gray-500">{selectedCustomer?.ContactNumber}</p>
                        </div>

                        {/* Items */}
                        <div className="p-4 border-b border-gray-100 border-dashed">
                            <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Items</p>
                            <div className="space-y-4">
                                {selectedServices.map(item => (
                                    <div key={item.ServiceID} className="flex justify-between items-start text-sm">
                                        <div className="flex flex-col gap-0.5 text-gray-800">
                                            <span className="font-bold text-gray-900">{item.ServiceName}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.Quantity} kg × ₱{item.Price}</span>
                                        </div>
                                        <span className="font-black text-indigo-600">₱{(item.Price * item.Quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="p-5 bg-indigo-50/30 border-b border-gray-100">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span className="text-gray-900">Total Amount</span>
                                <span className="text-emerald-600 text-2xl">₱{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Scheduling */}
                        <div className="p-5 bg-white space-y-4">
                            <h3 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Schedule Pickup</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={pickupDate}
                                        onChange={(e) => setPickupDate(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={pickupTime}
                                        onChange={(e) => setPickupTime(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-200 active:bg-indigo-700 transition-all text-base mt-4 flex justify-center items-center gap-2"
                    >
                        Confirm & Save Order <CheckCircle2 size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}
