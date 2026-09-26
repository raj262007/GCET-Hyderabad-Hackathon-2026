import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  ArrowRight, 
  Filter, 
  LayoutList, 
  LayoutGrid,
  Calendar,
  Layers
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function MoveHistoryView() {
  const { moveHistory } = useInventory();
  const [search, setSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const filteredMoves = moveHistory.filter(m => {
    const matchesSearch = 
      m.reference.toLowerCase().includes(search.toLowerCase()) ||
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.fromLocation.toLowerCase().includes(search.toLowerCase()) ||
      m.toLocation.toLowerCase().includes(search.toLowerCase());

    const matchesDocType = docTypeFilter === 'all' || m.docType === docTypeFilter;
    return matchesSearch && matchesDocType;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Reference', 'Doc Type', 'Product', 'From Location', 'To Location', 'Quantity', 'UoM', 'Status', 'User'];
    const rows = filteredMoves.map(m => [
      `"${m.date}"`,
      `"${m.reference}"`,
      `"${m.docType}"`,
      `"${m.productName}"`,
      `"${m.fromLocation}"`,
      `"${m.toLocation}"`,
      m.quantity,
      `"${m.uom}"`,
      `"${m.status}"`,
      `"${m.user || 'System'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Stock_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <History size={24} color="var(--primary)" />
            <span>Move History (Stock Ledger)</span>
          </h1>
          <p className="page-subtitle">
            Immutable double-entry audit trail tracking every movement of physical inventory
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* List / Grid view switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            <button 
              className={`icon-btn ${viewMode === 'list' ? 'btn-primary' : ''}`}
              style={{ width: '32px', height: '32px', borderRadius: '4px', border: 'none' }}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <LayoutList size={16} />
            </button>
            <button 
              className={`icon-btn ${viewMode === 'grid' ? 'btn-primary' : ''}`}
              style={{ width: '32px', height: '32px', borderRadius: '4px', border: 'none' }}
              onClick={() => setViewMode('grid')}
              title="Card View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={exportToCSV}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '340px' }}>
            <div className="global-search" style={{ width: '100%' }}>
              <Search className="global-search-icon" size={16} />
              <input 
                type="text" 
                placeholder="Search reference, product, location..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-filters">
            <select 
              className="select-filter"
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value)}
            >
              <option value="all">All Document Types</option>
              <option value="receipt">Receipts (Incoming)</option>
              <option value="delivery">Deliveries (Outgoing)</option>
              <option value="internal">Internal Transfers</option>
              <option value="adjustment">Stock Adjustments</option>
            </select>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Reference</th>
                  <th>Product</th>
                  <th>Source Location (From)</th>
                  <th>Destination Location (To)</th>
                  <th style={{ textAlign: 'right' }}>Quantity</th>
                  <th>Status</th>
                  <th>Operator</th>
                </tr>
              </thead>
              <tbody>
                {filteredMoves.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No inventory movements recorded matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredMoves.map(m => (
                    <tr key={m.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {m.date}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {m.reference}
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.productName}</td>
                      <td>
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {m.fromLocation}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {m.toLocation}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: m.quantity < 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.uom}
                      </td>
                      <td>
                        <span className="badge badge-done">
                          {m.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {m.user || 'System'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Kanban / Card View */
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredMoves.map(m => (
              <div 
                key={m.id}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                    {m.reference}
                  </span>
                  <span className="badge badge-done">{m.status}</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.productName}</div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)',
                  background: 'var(--bg-surface)',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.fromLocation.split('(')[0]}
                  </span>
                  <ArrowRight size={14} color="var(--primary)" />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {m.toLocation.split('(')[0]}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{m.date}</span>
                  <strong style={{ fontSize: '1rem', color: m.quantity < 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.uom}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
