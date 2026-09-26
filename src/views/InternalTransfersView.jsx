import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Search, 
  CheckCircle2, 
  MapPin, 
  Trash2, 
  Calendar,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useInventory } from '../context/InventoryContext';

export default function InternalTransfersView({ initialCreateOpen = false }) {
  const { 
    transfers, 
    products, 
    locations, 
    getProductStockAtLocation,
    createTransfer, 
    validateTransfer 
  } = useInventory();

  const [isModalOpen, setIsModalOpen] = useState(initialCreateOpen);
  const [search, setSearch] = useState('');
  const [sourceLocId, setSourceLocId] = useState('loc-wh-stock');
  const [destLocId, setDestLocId] = useState('loc-wh-prod');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [transferQty, setTransferQty] = useState(10);
  const [notes, setNotes] = useState('');

  const internalLocations = locations.filter(l => l.type === 'internal');
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const currentSourceStock = selectedProduct ? getProductStockAtLocation(selectedProduct.id, sourceLocId) : 0;

  const handleCreateAndValidate = (e) => {
    e.preventDefault();
    if (sourceLocId === destLocId) {
      alert('Source and Destination locations must be different.');
      return;
    }

    if (transferQty <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }

    if (transferQty > currentSourceStock) {
      if (!window.confirm(`Source location only has ${currentSourceStock} ${selectedProduct?.uom}. Proceed with transfer anyway?`)) {
        return;
      }
    }

    const newTrans = createTransfer({
      sourceLocationId: sourceLocId,
      destinationLocationId: destLocId,
      scheduledDate,
      notes,
      lines: [
        {
          productId: selectedProductId,
          qty: Number(transferQty),
          uom: selectedProduct?.uom || 'Units'
        }
      ]
    });

    // Validate immediately
    validateTransfer(newTrans.id);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    setIsModalOpen(false);
    setNotes('');
  };

  const filteredTransfers = transfers.filter(t => 
    t.reference.toLowerCase().includes(search.toLowerCase()) ||
    (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ArrowLeftRight size={24} color="var(--accent-teal)" />
            <span>Internal Transfers</span>
          </h1>
          <p className="page-subtitle">
            Shift stock between warehouse racks, bays, and production lines without altering company totals
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={15} />
          <span>New Transfer</span>
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '340px' }}>
            <div className="global-search" style={{ width: '100%' }}>
              <Search className="global-search-icon" size={16} />
              <input 
                type="text" 
                placeholder="Search reference or transfer note..." 
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
                <th>Source Location (From)</th>
                <th>Destination Location (To)</th>
                <th>Items Transferred</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No internal transfers recorded. Click "New Transfer" to move stock.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map(t => {
                  const source = locations.find(l => l.id === t.sourceLocationId);
                  const dest = locations.find(l => l.id === t.destinationLocationId);

                  return (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {t.reference}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{source ? source.name : 'WH/Stock'}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>{dest ? dest.name : 'WH/Prod'}</span>
                      </td>
                      <td>
                        {t.lines.map((l, i) => {
                          const prod = products.find(p => p.id === l.productId);
                          return (
                            <div key={i} style={{ fontSize: '0.825rem' }}>
                              <strong>{l.qty} {l.uom}</strong> - {prod ? prod.name : 'Product'}
                            </div>
                          );
                        })}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{t.scheduledDate}</td>
                      <td>
                        <span className={`badge badge-${t.status}`}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {t.status !== 'done' ? (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              validateTransfer(t.id);
                              confetti({ particleCount: 40 });
                            }}
                          >
                            <CheckCircle2 size={14} />
                            <span>Validate</span>
                          </button>
                        ) : (
                          <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
                            Transferred
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Transfer */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule & Execute Internal Transfer</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateAndValidate}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Source Location (From) *</label>
                    <select 
                      className="form-select"
                      value={sourceLocId}
                      onChange={(e) => setSourceLocId(e.target.value)}
                    >
                      {internalLocations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination Location (To) *</label>
                    <select 
                      className="form-select"
                      value={destLocId}
                      onChange={(e) => setDestLocId(e.target.value)}
                    >
                      {internalLocations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Product to Move *</label>
                    <select 
                      className="form-select"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantity to Shift *</label>
                    <input 
                      type="number" 
                      min="1"
                      className="form-input" 
                      value={transferQty}
                      onChange={(e) => setTransferQty(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Current Stock at Source: <strong style={{ color: 'var(--text-main)' }}>{currentSourceStock} {selectedProduct?.uom}</strong>.
                  Total company inventory remains unchanged; location ledgers update in real-time.
                </div>

                <div className="form-group">
                  <label className="form-label">Reason / Transfer Purpose</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Move steel to production rack for fabrication"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Execute & Validate Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
