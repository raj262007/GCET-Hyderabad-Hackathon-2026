import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Building2, 
  Package, 
  Trash2, 
  ArrowLeft,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useInventory } from '../context/InventoryContext';
import PrintSlipModal from '../components/PrintSlipModal';

export default function ReceiptsView({ initialCreateOpen = false }) {
  const { 
    receipts, 
    products, 
    locations, 
    createReceipt, 
    updateReceiptStatus, 
    validateReceipt 
  } = useInventory();

  // Navigation mode: 'list' or 'form'
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(initialCreateOpen);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [printDoc, setPrintDoc] = useState(null);

  // New receipt form state
  const [supplier, setSupplier] = useState('');
  const [destLocationId, setDestLocationId] = useState('loc-wh-stock');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([
    { productId: products[0]?.id || '', demandQty: 50, uom: products[0]?.uom || 'Units' }
  ]);

  const selectedReceipt = receipts.find(r => r.id === selectedReceiptId);

  // Add line to new receipt
  const addLine = () => {
    setLines([...lines, { productId: products[0]?.id || '', demandQty: 10, uom: products[0]?.uom || 'Units' }]);
  };

  const removeLine = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) updated[index].uom = prod.uom;
    }
    setLines(updated);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!supplier.trim()) {
      alert('Please enter vendor/supplier name.');
      return;
    }

    const newRec = createReceipt({
      supplier,
      destinationLocationId: destLocationId,
      scheduledDate,
      notes,
      lines: lines.map(l => ({
        productId: l.productId,
        demandQty: Number(l.demandQty) || 1,
        receivedQty: Number(l.demandQty) || 1,
        uom: l.uom
      }))
    });

    setIsCreatingNew(false);
    setSelectedReceiptId(newRec.id);
  };

  const handleValidate = (receiptId) => {
    const success = validateReceipt(receiptId);
    if (success) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  // Filtered receipts
  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = 
      r.reference.toLowerCase().includes(search.toLowerCase()) ||
      r.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ================= VIEW 1: Form View =================
  if (selectedReceipt || isCreatingNew) {
    const doc = selectedReceipt;
    const isEditingExisting = Boolean(doc);

    return (
      <div className="page-body">
        {/* Top return breadcrumb & actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSelectedReceiptId(null);
              setIsCreatingNew(false);
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Receipts List</span>
          </button>

          {isEditingExisting && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setPrintDoc(doc)}
              >
                <Printer size={15} />
                <span>Print Slip (GRN)</span>
              </button>

              {doc.status !== 'done' && doc.status !== 'canceled' && (
                <>
                  {doc.status === 'draft' && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => updateReceiptStatus(doc.id, 'ready')}
                    >
                      <span>Mark as Ready</span>
                    </button>
                  )}
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleValidate(doc.id)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Validate (Receive Stock)</span>
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => updateReceiptStatus(doc.id, 'canceled')}
                  >
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Existing Document Form Sheet */}
        {isEditingExisting ? (
          <div className="form-sheet animate-fade-in">
            {/* Header with Reference & Pipeline Ribbon */}
            <div className="form-sheet-header">
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Incoming Goods Receipt
                </div>
                <h2 className="form-ref-badge">{doc.reference}</h2>
              </div>

              {/* Odoo Status Pipeline Ribbon */}
              <div className="pipeline-ribbon">
                <div className={`pipeline-step ${doc.status === 'draft' ? 'active' : 'completed'}`}>
                  Draft
                </div>
                <div className={`pipeline-step ${doc.status === 'waiting' ? 'active' : (doc.status === 'ready' || doc.status === 'done' ? 'completed' : '')}`}>
                  Waiting
                </div>
                <div className={`pipeline-step ${doc.status === 'ready' ? 'active' : (doc.status === 'done' ? 'completed' : '')}`}>
                  Ready
                </div>
                <div className={`pipeline-step ${doc.status === 'done' ? 'active' : ''}`}>
                  Done
                </div>
                {doc.status === 'canceled' && (
                  <div className="pipeline-step active" style={{ background: 'var(--danger)' }}>
                    Canceled
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div>
                <label className="form-label">Receive From (Vendor / Supplier)</label>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px' }}>
                  {doc.supplier}
                </div>
              </div>

              <div>
                <label className="form-label">Destination Location</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '2px', color: 'var(--primary)' }}>
                  {locations.find(l => l.id === doc.destinationLocationId)?.name || 'WH/Stock'}
                </div>
              </div>

              <div>
                <label className="form-label">Scheduled Date</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '2px' }}>
                  {doc.scheduledDate || 'Immediate'}
                </div>
              </div>
            </div>

            {/* Product Lines Table */}
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
                Items & Received Quantities
              </h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th style={{ textAlign: 'right' }}>Demand Quantity</th>
                      <th style={{ textAlign: 'right' }}>Received Quantity</th>
                      <th>UoM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.lines.map((line, idx) => {
                      const prod = products.find(p => p.id === line.productId);
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{prod ? prod.name : 'Unknown Product'}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{prod ? prod.sku : '-'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{line.demandQty}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: doc.status === 'done' ? 'var(--success)' : 'var(--text-main)' }}>
                            {doc.status === 'done' ? (line.receivedQty || line.demandQty) : line.demandQty}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{line.uom}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation Notice */}
            {doc.status === 'done' ? (
              <div style={{ 
                background: 'var(--success-bg)', 
                border: '1px solid var(--success)', 
                padding: '14px 18px', 
                borderRadius: 'var(--radius-md)', 
                color: 'var(--success-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={20} />
                <div>
                  <strong>Stock Validated & Commited:</strong> Quantities have been automatically credited to warehouse inventory and recorded in the Move History ledger.
                </div>
              </div>
            ) : (
              <div style={{ 
                background: 'var(--bg-subtle)', 
                border: '1px solid var(--border-color)', 
                padding: '14px 18px', 
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}>
                💡 <em>Clicking "Validate" will instantly increase inventory by the received quantities and create a permanent audit log entry in the Stock Ledger.</em>
              </div>
            )}
          </div>
        ) : (
          /* Create New Receipt Form */
          <div className="form-sheet animate-fade-in">
            <div className="form-sheet-header">
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Create New Goods Receipt</h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Record incoming goods arriving from suppliers at the receiving dock
                </p>
              </div>
              <div className="pipeline-ribbon">
                <div className="pipeline-step active">Draft</div>
                <div className="pipeline-step">Waiting</div>
                <div className="pipeline-step">Ready</div>
                <div className="pipeline-step">Done</div>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Vendor / Supplier Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Tata Steel Tubes Ltd." 
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Location *</label>
                  <select 
                    className="form-select"
                    value={destLocationId}
                    onChange={(e) => setDestLocationId(e.target.value)}
                  >
                    {locations.filter(l => l.type === 'internal').map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Items Line Editor */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Line Items to Receive</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addLine}>
                    <Plus size={14} />
                    <span>Add Item Line</span>
                  </button>
                </div>

                {lines.map((line, index) => (
                  <div 
                    key={index}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1fr 1fr auto', 
                      gap: '12px', 
                      alignItems: 'flex-end',
                      marginBottom: '10px',
                      background: 'var(--bg-subtle)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div className="form-group">
                      <label className="form-label">Product</label>
                      <select 
                        className="form-select"
                        value={line.productId}
                        onChange={(e) => updateLine(index, 'productId', e.target.value)}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input 
                        type="number" 
                        min="1" 
                        className="form-input" 
                        value={line.demandQty}
                        onChange={(e) => updateLine(index, 'demandQty', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">UoM</label>
                      <input 
                        type="text" 
                        disabled 
                        className="form-input" 
                        value={line.uom}
                      />
                    </div>

                    {lines.length > 1 && (
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        style={{ height: '38px', color: 'var(--danger)' }}
                        onClick={() => removeLine(index)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Operational Notes / Po Reference</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  placeholder="e.g. Purchase order PO-2026-993, invoice attached"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsCreatingNew(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Draft Receipt
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Print Modal */}
        <PrintSlipModal 
          isOpen={Boolean(printDoc)}
          onClose={() => setPrintDoc(null)}
          doc={printDoc}
          type="receipt"
        />
      </div>
    );
  }

  // ================= VIEW 2: Default List View =================
  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ArrowDownLeft size={24} color="var(--info)" />
            <span>Receipts (Incoming Goods)</span>
          </h1>
          <p className="page-subtitle">
            Receive incoming vendor shipments and automatically increment warehouse stock
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsCreatingNew(true)}>
          <Plus size={15} />
          <span>New Receipt</span>
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '340px' }}>
            <div className="global-search" style={{ width: '100%' }}>
              <Search className="global-search-icon" size={16} />
              <input 
                type="text" 
                placeholder="Search reference or supplier..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-filters">
            <select 
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Receive From (Supplier)</th>
                <th>Destination Location</th>
                <th>Scheduled Date</th>
                <th>Items Count</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No receipts found. Click "New Receipt" to receive incoming inventory.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map(r => {
                  const loc = locations.find(l => l.id === r.destinationLocationId);
                  return (
                    <tr 
                      key={r.id} 
                      onClick={() => setSelectedReceiptId(r.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {r.reference}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.supplier}</td>
                      <td>
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {loc ? loc.name : 'WH/Stock'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{r.scheduledDate || '-'}</td>
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {r.lines ? r.lines.length : 0} item lines
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${r.status}`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedReceiptId(r.id)}
                        >
                          Open Form
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
