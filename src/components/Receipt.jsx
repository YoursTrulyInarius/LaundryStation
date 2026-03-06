import React from 'react';

/**
 * Receipt component for DingDong's Laundry Station.
 * Uses inline styles so it renders correctly both in-app and when exported to PDF
 * via the Electron printToPDF IPC flow (no Tailwind dependency in the hidden window).
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
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const s = {
        container: {
            background: '#fff',
            color: '#000',
            padding: '32px 24px',
            fontFamily: "'Courier New', Courier, monospace",
            maxWidth: '380px',
            margin: '0 auto',
            fontSize: '13px',
        },
        center: { textAlign: 'center', marginBottom: '20px' },
        h1: { fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 4px' },
        subtitle: { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 },
        divider: { borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0', margin: '8px 0', fontSize: '11px', textAlign: 'center' },
        row: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
        bold: { fontWeight: 'bold' },
        sectionDivider: { borderTop: '1px dashed #bbb', marginTop: '8px', paddingTop: '8px' },
        tableHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '8px', fontWeight: 'bold', fontSize: '11px' },
        itemRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
        totalSection: { borderTop: '2px solid #000', paddingTop: '8px', marginBottom: '20px' },
        totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 'bold' },
        vatNote: { fontSize: '10px', fontStyle: 'italic', color: '#666', marginTop: '4px' },
        pickupBox: { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '6px', padding: '12px', textAlign: 'center', marginBottom: '20px' },
        pickupLabel: { fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' },
        pickupDate: { fontSize: '17px', fontWeight: 'bold', margin: '4px 0' },
        footer: { textAlign: 'center', fontSize: '10px', borderTop: '1px solid #ddd', paddingTop: '8px' },
    };

    return (
        <div id="printable-receipt" style={s.container}>
            {/* Header */}
            <div style={s.center}>
                <h1 style={s.h1}>DingDong's</h1>
                <p style={s.subtitle}>Laundry Station &amp; Scheduling</p>
                <div style={s.divider}>OFFICIAL RECEIPT</div>
            </div>

            {/* Transaction Info */}
            <div style={{ marginBottom: '20px' }}>
                <div style={s.row}>
                    <span>TXN ID:</span>
                    <span style={s.bold}>#{TransactionID}</span>
                </div>
                <div style={s.row}>
                    <span>Date:</span>
                    <span>{formatLongDate(TransactionDate)}</span>
                </div>
                <div style={{ ...s.row, ...s.sectionDivider }}>
                    <span>Customer:</span>
                    <span style={s.bold}>{CustomerName}</span>
                </div>
                <div style={s.row}>
                    <span>Contact:</span>
                    <span>{ContactNumber}</span>
                </div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '20px' }}>
                <div style={s.tableHeader}>
                    <span style={{ flex: 1 }}>SERVICE</span>
                    <span style={{ width: '60px', textAlign: 'right' }}>QTY</span>
                    <span style={{ width: '80px', textAlign: 'right' }}>PRICE</span>
                </div>
                <div>
                    {items && items.map((item, index) => (
                        <div key={index} style={s.itemRow}>
                            <span style={{ flex: 1, textTransform: 'uppercase', paddingRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.ServiceName}</span>
                            <span style={{ width: '60px', textAlign: 'right' }}>{item.Quantity}kg</span>
                            <span style={{ width: '80px', textAlign: 'right' }}>₱{parseFloat(item.Subtotal).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total */}
            <div style={s.totalSection}>
                <div style={s.totalRow}>
                    <span>TOTAL:</span>
                    <span>₱{parseFloat(TotalAmount).toFixed(2)}</span>
                </div>
                <p style={s.vatNote}>Prices are inclusive of VAT.</p>
            </div>

            {/* Pickup Info */}
            <div style={s.pickupBox}>
                <p style={s.pickupLabel}>Schedule for Pickup</p>
                <p style={s.pickupDate}>{formatLongDate(PickupDate)}</p>
                <p>{formatTime(PickupTime)}</p>
            </div>

            {/* Footer */}
            <div style={s.footer}>
                <p>Thank you for choosing DingDong's!</p>
                <p>Please present this receipt when claiming.</p>
                <p style={{ marginTop: '8px' }}>Generated at {new Date().toLocaleString()}</p>
            </div>

            {/* Print media styles (for the window.print() button) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden; }
                    #printable-receipt, #printable-receipt * { visibility: visible; }
                    #printable-receipt {
                        position: absolute; left: 0; top: 0;
                        width: 100%; max-width: none;
                        border: none; padding: 0; margin: 0;
                    }
                    .no-print { display: none !important; }
                }
            ` }} />
        </div>
    );
}
