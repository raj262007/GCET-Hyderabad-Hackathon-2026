import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  MapPin, 
  AlertTriangle, 
  Edit3, 
  Eye, 
  SlidersHorizontal,
  X,
  CheckCircle2,
  DollarSign,
  ScanBarcode
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function ProductsView({ initialSearchQuery = '', onOpenScanner }) {
  const { 
    products, 
    locations, 
    stockLevels, 
    getProductTotalStock, 
    getProductReservedStock,
    getProductStockAtLocation,
    createProduct, 
    updateProduct 
  } = useInventory();

  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // all, in_stock, low_stock, out_of_stock

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingLocationStockProduct, setViewingLocationStockProduct] = useState(null);

  // New product form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Raw Materials',
    uom: 'Units',
    costPrice: '',
    salePrice: '',
    initialStock: '',
    initialLocationId: 'loc-wh-stock',
    minQty: 10,
    maxQty: 100,
    description: ''
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filter products
  const filteredProducts = products.filter(p => {
    const totalStock = getProductTotalStock(p.id);
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesStockStatus = true;
    if (stockStatusFilter === 'in_stock') matchesStockStatus = totalStock > (p.minQty || 0);
    else if (stockStatusFilter === 'low_stock') matchesStockStatus = totalStock <= (p.minQty || 0) && totalStock > 0;
    else if (stockStatusFilter === 'out_of_stock') matchesStockStatus = totalStock === 0;

    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      alert('Product Name and SKU are mandatory.');
      return;
    }

    createProduct({
      name: formData.name,
      sku: formData.sku.toUpperCase(),
      category: formData.category,
      uom: formData.uom,
      costPrice: Number(formData.costPrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      minQty: Number(formData.minQty) || 0,
      maxQty: Number(formData.maxQty) || 100,
      description: formData.description,
      initialStock: formData.initialStock ? Number(formData.initialStock) : 0,
      initialLocationId: formData.initialLocationId
    });

    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      sku: '',
      category: 'Raw Materials',
      uom: 'Units',
      costPrice: '',
      salePrice: '',
      initialStock: '',
      initialLocationId: 'loc-wh-stock',
      minQty: 10,
      maxQty: 100,
      description: ''
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      sku: editingProduct.sku.toUpperCase(),
      category: editingProduct.category,
      uom: editingProduct.uom,
      costPrice: Number(editingProduct.costPrice) || 0,
      salePrice: Number(editingProduct.salePrice) || 0,
      minQty: Number(editingProduct.minQty) || 0,
      maxQty: Number(editingProduct.maxQty) || 100,
      description: editingProduct.description
    });

    setEditingProduct(null);
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Package size={24} color="var(--primary)" />
            <span>Product Catalog & Multi-Location Stock</span>
          </h1>
          <p className="page-subtitle">
            Manage product master data, barcodes, location inventory, and reordering thresholds
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onOpenScanner}>
            <ScanBarcode size={15} />
            <span>Barcode Scan</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={15} />
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '340px' }}>
            <div className="global-search" style={{ width: '100%' }}>
              <Search className="global-search-icon" size={16} />
              <input 
                type="text" 
                placeholder="Search by name, SKU, or barcode..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-filters">
            <select 
              className="select-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select 
              className="select-filter"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock (Healthy)</option>
              <option value="low_stock">Low Stock (≤ Min)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU / Code</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>On Hand</th>
                <th style={{ textAlign: 'right' }}>Reserved</th>
                <th style={{ textAlign: 'right' }}>Free to Use</th>
                <th>UoM</th>
                <th>Reorder Rules</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No products found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const onHand = getProductTotalStock(p.id);
                  const reserved = getProductReservedStock(p.id);
                  const freeToUse = Math.max(0, onHand - reserved);
                  const isLow = onHand <= (p.minQty || 0);

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>{p.name}</strong>
                          {isLow && (
                            <span className="badge badge-canceled" title={`Stock (${onHand}) is at or below Min Reorder point (${p.minQty})`}>
                              Low Stock
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Barcode: {p.barcode || 'N/A'}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.sku}</td>
                      <td>
                        <span className="badge badge-ready">{p.category}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: isLow ? 'var(--danger)' : 'var(--text-main)', fontSize: '1rem' }}>
                        {onHand}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--warning)', fontWeight: 600 }}>
                        {reserved}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 700 }}>
                        {freeToUse}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.uom}</td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Min: <strong>{p.minQty || 0}</strong> | Max: <strong>{p.maxQty || 100}</strong>
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setViewingLocationStockProduct(p)}
                            title="View Stock Breakdown per Location"
                          >
                            <MapPin size={13} />
                            <span>Locations</span>
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingProduct(p)}
                            title="Edit Product"
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Product */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">Create New Product</h3>
              <button className="icon-btn" onClick={() => setIsCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Steel Rods (12mm)" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU / Code *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. STEEL-ROD-12" 
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Product Category</label>
                    <select 
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Raw Materials">Raw Materials</option>
                      <option value="Finished Goods">Finished Goods</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Electronics">Electronics</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit of Measure (UoM)</label>
                    <select 
                      className="form-select"
                      value={formData.uom}
                      onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                    >
                      <option value="Units">Units</option>
                      <option value="kg">kg (Kilograms)</option>
                      <option value="Pcs">Pcs (Pieces)</option>
                      <option value="Meters">Meters</option>
                      <option value="Liters">Liters</option>
                      <option value="Boxes">Boxes</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Cost Price (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 65" 
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sales Price (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 85" 
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    />
                  </div>
                </div>

                {/* Initial Stock (Optional) */}
                <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--primary)' }}>
                    INITIAL STOCK (OPTIONAL OPENING BALANCE)
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Initial Quantity</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="0"
                        value={formData.initialStock}
                        onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Initial Warehouse Location</label>
                      <select 
                        className="form-select"
                        value={formData.initialLocationId}
                        onChange={(e) => setFormData({ ...formData, initialLocationId: e.target.value })}
                      >
                        {locations.filter(l => l.type === 'internal').map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Reordering Rules */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Min Stock Threshold (Alert Point)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.minQty}
                      onChange={(e) => setFormData({ ...formData, minQty: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Target Quantity</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.maxQty}
                      onChange={(e) => setFormData({ ...formData, maxQty: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Notes / Specification</label>
                  <textarea 
                    className="form-textarea" 
                    rows={2}
                    placeholder="Technical specs, material grade, or supplier notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Product */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">Edit Product: {editingProduct.name}</h3>
              <button className="icon-btn" onClick={() => setEditingProduct(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingProduct.sku}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Min Reorder Alert</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editingProduct.minQty || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, minQty: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Target Stock</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editingProduct.maxQty || 100}
                      onChange={(e) => setEditingProduct({ ...editingProduct, maxQty: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Cost Price (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editingProduct.costPrice || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sale Price (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editingProduct.salePrice || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Location Stock Breakdown */}
      {viewingLocationStockProduct && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="var(--primary)" />
                <h3 className="modal-title">Stock per Location: {viewingLocationStockProduct.name}</h3>
              </div>
              <button className="icon-btn" onClick={() => setViewingLocationStockProduct(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Detailed real-time stock allocation across all registered warehouse zones and racks:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {locations.filter(l => l.type === 'internal').map(loc => {
                  const qty = getProductStockAtLocation(viewingLocationStockProduct.id, loc.id);
                  return (
                    <div 
                      key={loc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{loc.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Path: {loc.path}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: qty > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {qty}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                          {viewingLocationStockProduct.uom}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ 
                marginTop: '10px', 
                padding: '12px', 
                background: 'var(--primary-light)', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <strong style={{ color: 'var(--primary)' }}>TOTAL PHYSICAL ON HAND:</strong>
                <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                  {getProductTotalStock(viewingLocationStockProduct.id)} {viewingLocationStockProduct.uom}
                </strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingLocationStockProduct(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
