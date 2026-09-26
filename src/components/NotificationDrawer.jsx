import React from 'react';
import { 
  X, 
  AlertTriangle, 
  PlusCircle, 
  ArrowRight, 
  Check, 
  Package, 
  TrendingDown 
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function NotificationDrawer({ isOpen, onClose, onNavigateToReceipts }) {
  const { lowStockProducts, getProductTotalStock, createReceipt, locations } = useInventory();

  if (!isOpen) return null;

  const handleInstantReorder = (prod) => {
    const onHand = getProductTotalStock(prod.id);
    const neededQty = Math.max(10, (prod.maxQty || 100) - onHand);
    
    // Choose main stock location
    const destLoc = locations.find(l => l.path === 'WH/Stock')?.id || 'loc-wh-stock';

    createReceipt({
      supplier: 'Automated Replenishment Supplier',
      destinationLocationId: destLoc,
      scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      notes: `Automated reorder triggered due to low stock alert (${onHand} ${prod.uom} remaining <= min ${prod.minQty} ${prod.uom}).`,
      lines: [
        {
          productId: prod.id,
          demandQty: neededQty,
          receivedQty: 0,
          uom: prod.uom
        }
      ]
    });

    alert(`Draft Receipt created for ${neededQty} ${prod.uom} of ${prod.name}! Redirecting to Receipts...`);
    onClose();
    if (onNavigateToReceipts) {
      onNavigateToReceipts();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="kpi-icon-wrap" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="modal-title">Low Stock & Reorder Alerts</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Automated replenishment triggers based on configured min/max rules
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {lowStockProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
              <Check size={40} style={{ margin: '0 auto 10px', color: 'var(--success)' }} />
              <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>All Stock Levels Healthy</p>
              <p style={{ fontSize: '0.825rem' }}>No products have breached their minimum threshold reorder rule.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ 
                background: 'var(--warning-bg)', 
                border: '1px solid var(--warning)', 
                borderRadius: 'var(--radius-md)', 
                padding: '10px 14px', 
                fontSize: '0.82rem', 
                color: 'var(--warning-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TrendingDown size={16} />
                <span>
                  <strong>{lowStockProducts.length} items</strong> require immediate replenishment to prevent stockouts.
                </span>
              </div>

              {lowStockProducts.map(prod => {
                const onHand = getProductTotalStock(prod.id);
                const suggestedReorder = Math.max(10, (prod.maxQty || 100) - onHand);

                return (
                  <div 
                    key={prod.id}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-canceled">Critical Low</span>
                        <strong style={{ fontSize: '0.92rem' }}>{prod.name}</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        SKU: {prod.sku} | Min Alert: {prod.minQty} {prod.uom} | Max Target: {prod.maxQty} {prod.uom}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)', marginTop: '4px' }}>
                        Current Stock: {onHand} {prod.uom}
                      </div>
                    </div>

                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleInstantReorder(prod)}
                      title="Generate auto-replenishment receipt"
                    >
                      <PlusCircle size={14} />
                      <span>Reorder {suggestedReorder} {prod.uom}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
