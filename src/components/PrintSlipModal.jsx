import React from 'react';
import { X, Printer, CheckCircle, Package } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function PrintSlipModal({ isOpen, onClose, doc, type }) {
  const { products, locations } = useInventory();

  if (!isOpen || !doc) return null;

  const isReceipt = type === 'receipt';
  const title = isReceipt ? 'GOODS RECEIPT NOTE (GRN)' : 'DELIVERY ORDER & PACKING SLIP';

  const destOrSourceLoc = isReceipt 
    ? locations.find(l => l.id === doc.destinationLocationId)?.name 
    : locations.find(l => l.id === doc.sourceLocationId)?.name;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '750px', background: '#ffffff', color: '#0f172a' }}>
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} color="var(--primary)" />
            <h3 className="modal-title" style={{ color: '#0f172a' }}>Print Preview: {doc.reference}</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Printable Paper Area */}
        <div className="modal-body" style={{ padding: '36px', background: '#ffffff', color: '#0f172a', fontFamily: 'var(--font-sans)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#714b67', display: 'flex', alignItems: 'center', gap: '6px' }}>
                StockSense <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Enterprise IMS</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Main Central Logistics Hub - Plot 42, Industrial Zone, Pune
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                GSTIN: 27AABCS1429B1Z8 | Contact: operations@stocksense.io
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{title}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, color: '#714b67', marginTop: '4px' }}>
                {doc.reference}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Status: <strong style={{ textTransform: 'uppercase' }}>{doc.status}</strong>
              </div>
            </div>
          </div>

          {/* Barcode visual representation */}
          <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px dashed #cbd5e1' }}>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '1.6rem', 
              letterSpacing: '5px', 
              background: '#f1f5f9', 
              display: 'inline-block',
              padding: '6px 24px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1'
            }}>
              ||| | |||| | ||| | || |||| |
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{doc.reference}</div>
          </div>

          {/* Meta Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '16px 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                {isReceipt ? 'SUPPLIER / VENDOR:' : 'CUSTOMER / RECIPIENT:'}
              </p>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>
                {isReceipt ? doc.supplier : doc.customer}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                Standard Terms & Conditions Apply
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>SCHEDULED DATE:</p>
              <p style={{ fontWeight: 700 }}>{doc.scheduledDate || 'Not specified'}</p>
              
              <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginTop: '8px' }}>
                {isReceipt ? 'DESTINATION LOCATION:' : 'DISPATCH LOCATION:'}
              </p>
              <p style={{ fontWeight: 700 }}>{destOrSourceLoc || 'WH/Stock'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ padding: '16px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>#</th>
                  <th style={{ padding: '8px 12px' }}>Product Description</th>
                  <th style={{ padding: '8px 12px' }}>SKU</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Demand Qty</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Done Qty</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>UoM</th>
                </tr>
              </thead>
              <tbody>
                {doc.lines && doc.lines.map((line, idx) => {
                  const prod = products.find(p => p.id === line.productId);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {prod ? prod.name : 'Unknown Product'}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#64748b' }}>
                        {prod ? prod.sku : '-'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                        {line.demandQty}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                        {isReceipt ? (line.receivedQty || line.demandQty) : (line.doneQty || line.demandQty)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>
                        {line.uom}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {doc.notes && (
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#475569', marginBottom: '24px' }}>
              <strong>Operational Remarks:</strong> {doc.notes}
            </div>
          )}

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ borderBottom: '1px solid #94a3b8', height: '40px' }}></div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '6px' }}>
                Warehouse Incharge / Stock Inspector Signature
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', height: '40px' }}></div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '6px' }}>
                Carrier / Logistics Representative Signature
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Print Action */}
        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={16} />
            <span>Print Official Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
