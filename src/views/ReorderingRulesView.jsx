import React, { useState } from 'react';
import { 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Package, 
  TrendingDown, 
  Edit3,
  Sliders,
  X
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function ReorderingRulesView({ onNavigateToReceipts }) {
  const { 
    products, 
    locations, 
    getProductTotalStock, 
    updateProduct, 
    createReceipt 
  } = useInventory();

  const [search, setSearch] = useState('');
  const [editingRuleProd, setEditingRuleProd] = useState(null);
  const [minQty, setMinQty] = useState(10);
  const [maxQty, setMaxQty] = useState(100);

  const handleOpenEdit = (p) => {
    setEditingRuleProd(p);
    setMinQty(p.minQty || 0);
    setMaxQty(p.maxQty || 100);
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!editingRuleProd) return;
    updateProduct(editingRuleProd.id, {
      minQty: Number(minQty),
      maxQty: Number(maxQty)
    });
    setEditingRuleProd(null);
  };

  const handleTriggerReorder = (p) => {
    const onHand = getProductTotalStock(p.id);
    const needed = Math.max(10, (p.maxQty || 100) - onHand);
    const destLoc = locations.find(l => l.path === 'WH/Stock')?.id || 'loc-wh-stock';

    createReceipt({
      supplier: 'Replenishment Vendor (Automated)',
      destinationLocationId: destLoc,
      scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      notes: `Reordering rule replenishment for ${p.name} (Current: ${onHand} <= Min: ${p.minQty}).`,
      lines: [
        {
          productId: p.id,
          demandQty: needed,
          receivedQty: 0,
          uom: p.uom
        }
      ]
    });

    alert(`Draft Receipt created for ${needed} ${p.uom} of ${p.name}!`);
    if (onNavigateToReceipts) onNavigateToReceipts();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <AlertTriangle size={24} color="var(--warning)" />
            <span>Automated Reordering Rules</span>
          </h1>
          <p className="page-subtitle">
            Configure minimum threshold alert triggers and target stock levels to prevent inventory stockouts
          </p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '340px' }}>
            <div className="global-search" style={{ width: '100%' }}>
              <Search className="global-search-icon" size={16} />
              <input 
                type="text" 
                placeholder="Search products by name or SKU..." 
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
                <th>Product</th>
                <th>SKU</th>
                <th style={{ textAlign: 'right' }}>Current On Hand</th>
                <th style={{ textAlign: 'right' }}>Min Threshold (Alert)</th>
                <th style={{ textAlign: 'right' }}>Max Target Stock</th>
                <th>Rule Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const onHand = getProductTotalStock(p.id);
                const isBreached = onHand <= (p.minQty || 0);

                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{p.sku}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.05rem', color: isBreached ? 'var(--danger)' : 'var(--text-main)' }}>
                      {onHand} {p.uom}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {p.minQty || 0} {p.uom}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {p.maxQty || 100} {p.uom}
                    </td>
                    <td>
                      {isBreached ? (
                        <span className="badge badge-canceled">
                          <TrendingDown size={13} /> Reorder Triggered
                        </span>
                      ) : (
                        <span className="badge badge-done">
                          <CheckCircle2 size={13} /> Stock Healthy
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {isBreached && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleTriggerReorder(p)}
                          >
                            <PlusCircle size={14} />
                            <span>Reorder</span>
                          </button>
                        )}
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(p)}
                          title="Configure Min/Max"
                        >
                          <Edit3 size={14} />
                          <span>Configure</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Reorder Rule */}
      {editingRuleProd && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Configure Rule: {editingRuleProd.name}</h3>
              <button className="icon-btn" onClick={() => setEditingRuleProd(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveRule}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  When on-hand quantity falls to or below Min Quantity, the system flags the product for replenishment.
                </p>

                <div className="form-group">
                  <label className="form-label">Minimum Quantity (Alert Threshold)</label>
                  <input 
                    type="number" 
                    min="0"
                    className="form-input" 
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Quantity (Target Capacity)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="form-input" 
                    value={maxQty}
                    onChange={(e) => setMaxQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRuleProd(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Thresholds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
