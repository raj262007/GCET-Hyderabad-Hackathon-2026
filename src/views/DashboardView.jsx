import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  SlidersHorizontal,
  Plus, 
  Filter, 
  Layers, 
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function DashboardView({ onNavigate, onOpenNewReceipt, onOpenNewDelivery, onOpenNewTransfer }) {
  const { 
    products, 
    receipts, 
    deliveries, 
    transfers, 
    adjustments, 
    locations, 
    warehouses,
    lowStockProducts, 
    getProductTotalStock 
  } = useInventory();

  // Dynamic Filters state as mandated in Problem Statement
  const [filterDocType, setFilterDocType] = useState('all'); // all, receipts, delivery, internal, adjustments
  const [filterStatus, setFilterStatus] = useState('all'); // all, draft, waiting, ready, done, canceled
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // KPI Calculations
  const totalProductsCount = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + getProductTotalStock(p.id), 0);
  const lowStockCount = lowStockProducts.length;
  
  const pendingReceipts = receipts.filter(r => r.status === 'ready' || r.status === 'waiting' || r.status === 'draft');
  const pendingDeliveries = deliveries.filter(d => d.status === 'ready' || d.status === 'waiting' || d.status === 'draft');
  const scheduledTransfers = transfers.filter(t => t.status === 'ready' || t.status === 'draft');

  // Kanban Card Stats
  const receiptsToReceive = receipts.filter(r => r.status === 'ready').length;
  const receiptsWaiting = receipts.filter(r => r.status === 'waiting').length;
  
  const deliveriesToDeliver = deliveries.filter(d => d.status === 'ready').length;
  const deliveriesWaiting = deliveries.filter(d => d.status === 'waiting').length;

  const transfersToProcess = transfers.filter(t => t.status === 'ready').length;

  // Build unified filtered list of operations
  const allOps = [
    ...receipts.map(r => ({
      id: r.id,
      docType: 'receipt',
      reference: r.reference,
      partner: r.supplier,
      date: r.scheduledDate,
      status: r.status,
      warehouseId: locations.find(l => l.id === r.destinationLocationId)?.warehouseId || 'wh-main',
      lines: r.lines,
      itemCount: r.lines ? r.lines.length : 0
    })),
    ...deliveries.map(d => ({
      id: d.id,
      docType: 'delivery',
      reference: d.reference,
      partner: d.customer,
      date: d.scheduledDate,
      status: d.status,
      warehouseId: locations.find(l => l.id === d.sourceLocationId)?.warehouseId || 'wh-main',
      lines: d.lines,
      itemCount: d.lines ? d.lines.length : 0
    })),
    ...transfers.map(t => ({
      id: t.id,
      docType: 'internal',
      reference: t.reference,
      partner: 'Internal Warehouse Movement',
      date: t.scheduledDate,
      status: t.status,
      warehouseId: locations.find(l => l.id === t.sourceLocationId)?.warehouseId || 'wh-main',
      lines: t.lines,
      itemCount: t.lines ? t.lines.length : 0
    })),
    ...adjustments.map(a => {
      const prod = products.find(p => p.id === a.productId);
      return {
        id: a.id,
        docType: 'adjustment',
        reference: a.reference,
        partner: `Reconciliation (${prod ? prod.name : 'Stock'})`,
        date: a.date.split('T')[0],
        status: a.status,
        warehouseId: locations.find(l => l.id === a.locationId)?.warehouseId || 'wh-main',
        lines: [{ productId: a.productId }],
        itemCount: 1
      };
    })
  ];

  // Apply Dynamic Filters
  const filteredOps = allOps.filter(op => {
    // 1. Doc Type filter
    if (filterDocType !== 'all') {
      if (filterDocType === 'receipts' && op.docType !== 'receipt') return false;
      if (filterDocType === 'delivery' && op.docType !== 'delivery') return false;
      if (filterDocType === 'internal' && op.docType !== 'internal') return false;
      if (filterDocType === 'adjustments' && op.docType !== 'adjustment') return false;
    }

    // 2. Status filter
    if (filterStatus !== 'all' && op.status !== filterStatus) return false;

    // 3. Warehouse filter
    if (filterWarehouse !== 'all' && op.warehouseId !== filterWarehouse) return false;

    // 4. Product Category filter
    if (filterCategory !== 'all') {
      const hasCategoryMatch = op.lines && op.lines.some(line => {
        const prod = products.find(p => p.id === line.productId);
        return prod && prod.category === filterCategory;
      });
      if (!hasCategoryMatch) return false;
    }

    return true;
  });

  return (
    <div className="page-body">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Layers size={24} color="var(--primary)" />
            <span>Inventory Operations Dashboard</span>
          </h1>
          <p className="page-subtitle">
            Real-time snapshot of inventory throughput, operations, and dynamic multi-criteria filters
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('products')}>
            <Package size={15} />
            <span>View All Products</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={onOpenNewReceipt}>
            <Plus size={15} />
            <span>New Receipt</span>
          </button>
        </div>
      </div>

      {/* Mandatory Dashboard KPIs Grid */}
      <div className="kpi-grid">
        {/* KPI 1: Total Products in Stock */}
        <div className="kpi-card" onClick={() => onNavigate('products')}>
          <div className="kpi-card-header">
            <span className="kpi-title">Products in Stock</span>
            <div className="kpi-icon-wrap" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Package size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{totalProductsCount}</div>
            <div className="kpi-subtext">
              <span>{totalStockUnits.toLocaleString()} total units on hand</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Low Stock / Out of Stock */}
        <div className="kpi-card" onClick={() => onNavigate('reordering')}>
          <div className="kpi-card-header">
            <span className="kpi-title">Low Stock Items</span>
            <div className="kpi-icon-wrap" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {lowStockCount}
            </div>
            <div className="kpi-subtext">
              <span>{lowStockCount > 0 ? 'Action required: Breached reorder point' : 'All stock above minimum threshold'}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Pending Receipts */}
        <div className="kpi-card" onClick={() => onNavigate('receipts')}>
          <div className="kpi-card-header">
            <span className="kpi-title">Pending Receipts</span>
            <div className="kpi-icon-wrap" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{pendingReceipts.length}</div>
            <div className="kpi-subtext">
              <span>{receiptsToReceive} ready at dock for validation</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Deliveries */}
        <div className="kpi-card" onClick={() => onNavigate('deliveries')}>
          <div className="kpi-card-header">
            <span className="kpi-title">Pending Deliveries</span>
            <div className="kpi-icon-wrap" style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{pendingDeliveries.length}</div>
            <div className="kpi-subtext">
              <span>{deliveriesToDeliver} ready for packing & dispatch</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Internal Transfers Scheduled */}
        <div className="kpi-card" onClick={() => onNavigate('transfers')}>
          <div className="kpi-card-header">
            <span className="kpi-title">Internal Transfers</span>
            <div className="kpi-icon-wrap" style={{ background: 'var(--accent-teal-bg)', color: 'var(--accent-teal)' }}>
              <ArrowLeftRight size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{scheduledTransfers.length}</div>
            <div className="kpi-subtext">
              <span>{transfersToProcess} ready to shift between locations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Kanban Overview Cards (Exact Odoo 17/18 IMS Style) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Operations Overview</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Warehouse execution workflows
          </span>
        </div>

        <div className="ops-grid">
          {/* Card 1: Receipts */}
          <div className="op-card">
            <div className="op-card-header">
              <div className="op-card-title">
                <ArrowDownLeft size={20} color="var(--info)" />
                <span>Receipts (Incoming Goods)</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onOpenNewReceipt}>
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>
            <div className="op-card-body">
              <div className="op-metric-row">
                <div className="op-metric-large">
                  <span className="op-metric-num" style={{ color: 'var(--info)' }}>{receiptsToReceive}</span>
                  <span className="op-metric-label">To Process</span>
                </div>
                <div className="op-pill-group">
                  <div className="op-pill" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }} onClick={() => onNavigate('receipts')}>
                    <span>{receiptsToReceive} Ready</span>
                  </div>
                  {receiptsWaiting > 0 && (
                    <div className="op-pill" style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }} onClick={() => onNavigate('receipts')}>
                      <span>{receiptsWaiting} Waiting</span>
                    </div>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Incoming shipments from vendor purchase orders waiting to be counted & shelved.
              </p>
            </div>
            <div className="op-card-footer">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tata Steel, Jindal, Hardware</span>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('receipts')}>
                <span>Manage Receipts</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>

          {/* Card 2: Delivery Orders */}
          <div className="op-card">
            <div className="op-card-header">
              <div className="op-card-title">
                <ArrowUpRight size={20} color="var(--warning)" />
                <span>Delivery Orders (Outgoing Goods)</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onOpenNewDelivery}>
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>
            <div className="op-card-body">
              <div className="op-metric-row">
                <div className="op-metric-large">
                  <span className="op-metric-num" style={{ color: 'var(--warning)' }}>{deliveriesToDeliver}</span>
                  <span className="op-metric-label">To Deliver</span>
                </div>
                <div className="op-pill-group">
                  <div className="op-pill" style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }} onClick={() => onNavigate('deliveries')}>
                    <span>{deliveriesToDeliver} Ready</span>
                  </div>
                  {deliveriesWaiting > 0 && (
                    <div className="op-pill" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }} onClick={() => onNavigate('deliveries')}>
                      <span>{deliveriesWaiting} Awaiting Stock</span>
                    </div>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Customer orders scheduled for item picking, packaging, and carrier dispatch.
              </p>
            </div>
            <div className="op-card-footer">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Apex Modern, Zenith Studios</span>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('deliveries')}>
                <span>Manage Deliveries</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>

          {/* Card 3: Internal Transfers */}
          <div className="op-card">
            <div className="op-card-header">
              <div className="op-card-title">
                <ArrowLeftRight size={20} color="var(--accent-teal)" />
                <span>Internal Transfers</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onOpenNewTransfer}>
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>
            <div className="op-card-body">
              <div className="op-metric-row">
                <div className="op-metric-large">
                  <span className="op-metric-num" style={{ color: 'var(--accent-teal)' }}>{transfersToProcess}</span>
                  <span className="op-metric-label">Scheduled</span>
                </div>
                <div className="op-pill-group">
                  <div className="op-pill" style={{ background: 'var(--accent-teal-bg)', color: 'var(--accent-teal)' }} onClick={() => onNavigate('transfers')}>
                    <span>{transfersToProcess} In Transit</span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Stock movements between warehouse racks, bays, and production floors.
              </p>
            </div>
            <div className="op-card-footer">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Main Store ➔ Production</span>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('transfers')}>
                <span>View Transfers</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Multi-Criteria Filters Toolbar (PDF Requirement) */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="var(--primary)" />
            <strong style={{ fontSize: '0.95rem' }}>Dynamic Operational Documents Filter</strong>
            <span style={{ fontSize: '0.75rem', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              {filteredOps.length} matches
            </span>
          </div>

          <div className="table-filters">
            {/* Filter 1: By Document Type */}
            <select 
              className="select-filter"
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
            >
              <option value="all">Doc Type: All Operations</option>
              <option value="receipts">Receipts (Incoming)</option>
              <option value="delivery">Delivery Orders (Outgoing)</option>
              <option value="internal">Internal Transfers</option>
              <option value="adjustments">Stock Adjustments</option>
            </select>

            {/* Filter 2: By Status */}
            <select 
              className="select-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Status: All Statuses</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </select>

            {/* Filter 3: By Warehouse / Location */}
            <select 
              className="select-filter"
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
            >
              <option value="all">Warehouse: All Facilities</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>

            {/* Filter 4: By Product Category */}
            <select 
              className="select-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Category: All Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Finished Goods">Finished Goods</option>
              <option value="Hardware">Hardware</option>
              <option value="Packaging">Packaging</option>
            </select>

            {(filterDocType !== 'all' || filterStatus !== 'all' || filterWarehouse !== 'all' || filterCategory !== 'all') && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFilterDocType('all');
                  setFilterStatus('all');
                  setFilterWarehouse('all');
                  setFilterCategory('all');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Live Filtered Operations Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Operation Type</th>
                <th>Partner / Description</th>
                <th>Scheduled Date</th>
                <th>Warehouse</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOps.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No operations matched your dynamic filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOps.map(op => {
                  const wh = warehouses.find(w => w.id === op.warehouseId);
                  return (
                    <tr key={op.id + op.reference}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {op.reference}
                      </td>
                      <td>
                        <span className={`badge ${
                          op.docType === 'receipt' ? 'badge-ready' : 
                          op.docType === 'delivery' ? 'badge-waiting' : 
                          op.docType === 'internal' ? 'badge-draft' : 'badge-done'
                        }`}>
                          {op.docType === 'receipt' ? 'Receipt (In)' : 
                           op.docType === 'delivery' ? 'Delivery (Out)' : 
                           op.docType === 'internal' ? 'Internal Move' : 'Adjustment'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{op.partner}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{op.date || '-'}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {wh ? wh.code : 'WH'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${op.status}`}>
                          {op.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            if (op.docType === 'receipt') onNavigate('receipts');
                            else if (op.docType === 'delivery') onNavigate('deliveries');
                            else if (op.docType === 'internal') onNavigate('transfers');
                            else onNavigate('adjustments');
                          }}
                        >
                          View Details
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
