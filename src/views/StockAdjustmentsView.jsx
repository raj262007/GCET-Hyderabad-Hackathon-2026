import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  TrendingDown, 
  TrendingUp,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useInventory } from '../context/InventoryContext';

export default function StockAdjustmentsView({ initialCreateOpen = false, preselectedProduct = null }) {
  const { 
    adjustments, 
    products, 
    locations, 
    getProductStockAtLocation, 
    createAdjustment 
  } = useInventory();

  const [isModalOpen, setIsModalOpen] = useState(initialCreateOpen || Boolean(preselectedProduct));
  const [search, setSearch] = useState('');
  
  const [productId, setProductId] = useState(preselectedProduct?.id || products[0]?.id || '');
  const [locationId, setLocationId] = useState('loc-wh-stock');
  const [countedQty, setCountedQty] = useState('');
  const [reason, setReason] = useState('');

  const selectedProduct = products.find(p => p.id === productId);
  const recordedQty = selectedProduct ? getProductStockAtLocation(selectedProduct.id, locationId) : 0;
  const difference = countedQty !== '' ? Number(countedQty) - recordedQty : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (countedQty === '') {
      alert('Please enter the physically counted quantity.');
      return;
    }

    createAdjustment({
      productId,
      locationId,
      countedQty: Number(countedQty),
      reason: reason || 'Physical inventory cycle count reconciliation'
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    setIsModalOpen(false);
    setCountedQty('');
    setReason('');
  };

  const filteredAdjustments = adjustments.filter(a => {
    const prod = products.find(p => p.id === a.productId);
    const searchLower = search.toLowerCase();
    return (
      a.reference.toLowerCase().includes(searchLower) ||
      (a.reason && a.reason.toLowerCase().includes(searchLower)) ||
      (prod && prod.name.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <SlidersHorizontal size={24} color="var(--primary)" />
            <span>Stock Adjustments (Cycle Counting)</span>
          </h1>
          <p className="page-subtitle">
            Reconcile physical inventory counts with recorded system balances and write off damaged stock
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={15} />
          <span>New Stock Adjustment</span>
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '340px' }}>
            <div className="global-search" style={{ width: '100%' }}>
              <Search className="global-search-icon" size={16} />
              <input 
                type="text" 
                placeholder="Search reference, reason, or product..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Product</th>
                <th>Warehouse Location</th>
                <th style={{ textAlign: 'right' }}>Recorded Qty</th>
                <th style={{ textAlign: 'right' }}>Counted Qty</th>
                <th style={{ textAlign: 'right' }}>Difference</th>
                <th>Reason / Write-off Cause</th>
                <th>Audit Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No stock adjustments recorded. Click "New Stock Adjustment" to reconcile physical counts.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map(a => {
                  const prod = products.find(p => p.id === a.productId);
                  const loc = locations.find(l => l.id === a.locationId);

                  return (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {a.reference}
                      </td>
                      <td style={{ fontWeight: 600 }}>{prod ? prod.name : 'Unknown Product'}</td>
                      <td>
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {loc ? loc.name : 'WH/Stock'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {a.recordedQty} {prod ? prod.uom : ''}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {a.countedQty} {prod ? prod.uom : ''}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800 }}>
                        {a.difference > 0 ? (
                          <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <TrendingUp size={14} /> +{a.difference}
                          </span>
                        ) : a.difference < 0 ? (
                          <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <TrendingDown size={14} /> {a.difference}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>0 (Matched)</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        {a.reason}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {a.date ? a.date.replace('T', ' ').substring(0, 16) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Adjustment */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Inventory Count Adjustment</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Product *</label>
                  <select 
                    className="form-select"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Warehouse Location *</label>
                  <select 
                    className="form-select"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                  >
                    {locations.filter(l => l.type === 'internal').map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Recorded vs Counted Comparison Box */}
                <div style={{ 
                  background: 'var(--bg-subtle)', 
                  border: '1px solid var(--border-color)', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RECORDED ON HAND</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
                      {recordedQty}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedProduct?.uom}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PHYSICAL COUNT *</div>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, padding: '4px' }}
                      placeholder="e.g. 97"
                      required
                      value={countedQty}
                      onChange={(e) => setCountedQty(e.target.value)}
                      autoFocus
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{selectedProduct?.uom}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DISCREPANCY</div>
                    <div style={{ 
                      fontSize: '1.6rem', 
                      fontWeight: 800, 
                      marginTop: '4px',
                      color: difference < 0 ? 'var(--danger)' : difference > 0 ? 'var(--success)' : 'var(--text-muted)'
                    }}>
                      {difference > 0 ? `+${difference}` : difference}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Difference</div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Adjustment Reason / Notes *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 3 kg steel damaged during warehouse transfer / physical count variance"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
