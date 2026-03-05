import React from 'react';

/**
 * Receipt component for DingDong's Laundry Station.
 * Designed to be clean, simple, and printable on any printer.
 * Uses utility classes for layout and custom @media print styles.
 */
export default function Receipt({ transaction }) {
    if (!transaction) return null;

    const {
        TransactionID,
        TransactionDate,
        CustomerName,
        ContactNumber,
        TotalAmount,
        PickupDate,
        PickupTime,
        items
    } = transaction;

    const formatLongDate = (dateStr) => {
        if (!dateStr) return 'Not Scheduled';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).replace(',', '');
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        // Handle HH:mm:ss or HH:mm
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <div id="printable-receipt" className="receipt-container bg-white text-black p-8 font-mono max-w-[400px] mx-auto border-2 border-gray-100 mb-20 print:border-0 print:p-0 print:m-0 print:max-w-none">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">DingDong's</h1>
                <p className="text-sm font-bold uppercase">Laundry Station & Scheduling</p>
                <div className="mt-2 text-xs border-y border-black py-1">
                    OFFICIAL RECEIPT
                </div>
            </div>

            {/* Transaction Info */}
            <div className="space-y-1 mb-6 text-sm">
                <div className="flex justify-between">
                    <span>TXN ID:</span>
                    <span className="font-bold">#{TransactionID}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatLongDate(TransactionDate)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-gray-300 pt-1 mt-2">
                    <span>Customer:</span>
                    <span className="font-bold">{CustomerName}</span>
                </div>
                <div className="flex justify-between">
                    <span>Contact:</span>
                    <span>{ContactNumber}</span>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
                <div className="flex justify-between text-xs font-bold border-b-2 border-black pb-1 mb-2">
                    <span className="flex-1">SERVICE</span>
                    <span className="w-16 text-right">QTY</span>
                    <span className="w-20 text-right">PRICE</span>
                </div>
                <div className="space-y-2 text-sm">
                    {items && items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start">
                            <span className="flex-1 truncate pr-2 uppercase">{item.ServiceName}</span>
                            <span className="w-16 text-right">{item.Quantity}kg</span>
                            <span className="w-20 text-right">₱{parseFloat(item.Subtotal).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total */}
            <div className="border-t-2 border-black pt-2 mb-6">
                <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL:</span>
                    <span>₱{parseFloat(TotalAmount).toFixed(2)}</span>
                </div>
                <p className="text-[10px] italic mt-1 text-gray-500 print:text-black">Prices are inclusive of VAT.</p>
            </div>

            {/* Pickup Info */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-6 print:bg-transparent print:border-black text-center">
                <p className="text-xs font-bold uppercase mb-1">Schedule for Pickup</p>
                <p className="font-bold text-lg">{formatLongDate(PickupDate)}</p>
                <p className="text-sm">{formatTime(PickupTime)}</p>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] space-y-1">
                <p>Thank you for choosing DingDong's!</p>
                <p>Please present this receipt when claiming.</p>
                <p className="mt-4 border-t border-gray-200 pt-2 print:border-black">Generated at {new Date().toLocaleString()}</p>
            </div>

            {/* Printing Styles Inline for Easy Injection */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-receipt, #printable-receipt * {
                        visibility: visible;
                    }
                    #printable-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: none;
                        border: none;
                        padding: 0;
                        margin: 0;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            ` }} />
        </div>
    );
}
