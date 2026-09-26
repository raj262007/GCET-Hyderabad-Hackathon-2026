import React, { useState } from 'react';
import { 
  X, 
  ScanBarcode, 
  Package, 
  CheckCircle, 
  ArrowRight, 
  MapPin, 
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function BarcodeScannerModal({ isOpen, onClose, onSelectAction }) {
  const { products, locations, stockLevels, getProductTotalStock } = useInventory();
  const [scannedInput, setScannedInput] = useState('');
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [isScanningSim, setIsScanningSim] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (query) => {
    setScannedInput(query);
    const clean = query.trim().toLowerCase();
    if (!clean) {
      setMatchedProduct(null);
      return;
    }
    const found = products.find(p => 
      p.sku.toLowerCase() === clean || 
      p.barcode === clean || 
      p.name.toLowerCase().includes(clean)
    );
    setMatchedProduct(found || null);
  };

  const handleSimulateScan = (prod) => {
    setIsScanningSim(true);
    setScannedInput(prod.sku);
    setTimeout(() => {
      setMatchedProduct(prod);
      setIsScanningSim(false);
    }, 400);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="kpi-icon-wrap" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <ScanBarcode size={20} />
            </div>
            <div>
              <h3 className="modal-title">Live Barcode & SKU Scanner</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Scan product barcode or enter SKU for instant warehouse lookup
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Input field */}
          <div className="form-group">
            <label className="form-label">Scan Barcode / SKU / Product Name</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Scan or type e.g. STEEL-ROD-12, 890123456701..."
                value={scannedInput}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              {scannedInput && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setScannedInput(''); setMatchedProduct(null); }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Click Demo Barcodes */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              ⚡ Quick Test Barcodes (Click to simulate laser scan):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {products.map(p => (
                <button
                  key={p.id}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                  onClick={() => handleSimulateScan(p)}
                >
                  <ScanBarcode size={13} />
                  <span>{p.sku}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scanned Result Card */}
          {matchedProduct ? (
            <div 
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="badge badge-ready">{matchedProduct.category}</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
                    {matchedProduct.name}
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>SKU: {matchedProduct.sku}</span>
                    <span>BARCODE: {matchedProduct.barcode}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ON HAND</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {getProductTotalStock(matchedProduct.id)} {matchedProduct.uom}
                  </div>
                </div>
              </div>

              {/* Location Breakdown */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  STOCK AVAILABILITY PER LOCATION:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                  {locations.filter(l => l.type === 'internal').map(loc => {
                    const stock = stockLevels.find(sl => sl.productId === matchedProduct.id && sl.locationId === loc.id);
                    const qty = stock ? stock.qtyOnHand : 0;
                    return (
                      <div 
                        key={loc.id}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {loc.name.split('(')[0]}
                        </span>
                        <strong style={{ fontSize: '0.85rem' }}>{qty} {matchedProduct.uom}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    onClose();
                    onSelectAction('receipt', matchedProduct);
                  }}
                >
                  <Plus size={15} />
                  <span>Receive Stock</span>
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    onClose();
                    onSelectAction('delivery', matchedProduct);
                  }}
                >
                  <Minus size={15} />
                  <span>Deliver / Pick</span>
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onClose();
                    onSelectAction('adjustment', matchedProduct);
                  }}
                >
                  Adjust Count
                </button>
              </div>
            </div>
          ) : scannedInput ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              <Package size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p>No product found matching "<strong>{scannedInput}</strong>"</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Check SKU spelling or scan another item.</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              <ScanBarcode size={44} style={{ margin: '0 auto 10px', color: 'var(--primary)', opacity: 0.7 }} />
              <p style={{ fontWeight: 600 }}>Laser Scanner Ready</p>
              <p style={{ fontSize: '0.8rem' }}>Enter any SKU above or click one of the quick test barcodes</p>
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
