import React from 'react';
import { 
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  SlidersHorizontal, 
  Package, 
  History, 
  Settings, 
  User, 
  LogOut,
  AlertTriangle,
  Boxes,
  Layers
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const { 
    currentUser, 
    receipts, 
    deliveries, 
    transfers, 
    lowStockProducts 
  } = useInventory();

  // Pending counts for badges
  const pendingReceipts = receipts.filter(r => r.status === 'ready' || r.status === 'waiting').length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'ready' || d.status === 'waiting').length;
  const pendingTransfers = transfers.filter(t => t.status === 'ready').length;

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo">
          <div className="brand-icon">
            <Boxes size={20} />
          </div>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>Stock</span>
            <span>Sense</span>
            <span style={{ 
              fontSize: '0.62rem', 
              background: 'rgba(113, 75, 103, 0.2)', 
              color: 'var(--primary)', 
              padding: '1px 5px', 
              borderRadius: '4px',
              marginLeft: '6px',
              fontWeight: 700 
            }}>
              odoo
            </span>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="sidebar-nav">
        {/* Main Dashboard */}
        <button 
          className={`sidebar-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        {/* Operations Section */}
        <div className="sidebar-section-title">Operations</div>
        
        <button 
          className={`sidebar-item ${currentTab === 'receipts' ? 'active' : ''}`}
          onClick={() => setCurrentTab('receipts')}
        >
          <ArrowDownLeft size={18} />
          <span>Receipts (Incoming)</span>
          {pendingReceipts > 0 && (
            <span className="sidebar-badge" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>
              {pendingReceipts}
            </span>
          )}
        </button>

        <button 
          className={`sidebar-item ${currentTab === 'deliveries' ? 'active' : ''}`}
          onClick={() => setCurrentTab('deliveries')}
        >
          <ArrowUpRight size={18} />
          <span>Delivery Orders</span>
          {pendingDeliveries > 0 && (
            <span className="sidebar-badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
              {pendingDeliveries}
            </span>
          )}
        </button>

        <button 
          className={`sidebar-item ${currentTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setCurrentTab('transfers')}
        >
          <ArrowLeftRight size={18} />
          <span>Internal Transfers</span>
          {pendingTransfers > 0 && (
            <span className="sidebar-badge" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
              {pendingTransfers}
            </span>
          )}
        </button>

        <button 
          className={`sidebar-item ${currentTab === 'adjustments' ? 'active' : ''}`}
          onClick={() => setCurrentTab('adjustments')}
        >
          <SlidersHorizontal size={18} />
          <span>Stock Adjustments</span>
        </button>

        {/* Products Section */}
        <div className="sidebar-section-title">Inventory & Stock</div>

        <button 
          className={`sidebar-item ${currentTab === 'products' ? 'active' : ''}`}
          onClick={() => setCurrentTab('products')}
        >
          <Package size={18} />
          <span>Products</span>
          {lowStockProducts.length > 0 && (
            <span className="sidebar-badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)' }}>
              {lowStockProducts.length} low
            </span>
          )}
        </button>

        <button 
          className={`sidebar-item ${currentTab === 'reordering' ? 'active' : ''}`}
          onClick={() => setCurrentTab('reordering')}
        >
          <AlertTriangle size={18} />
          <span>Reordering Rules</span>
        </button>

        <button 
          className={`sidebar-item ${currentTab === 'moves' ? 'active' : ''}`}
          onClick={() => setCurrentTab('moves')}
        >
          <History size={18} />
          <span>Move History (Ledger)</span>
        </button>

        {/* Settings & Configuration */}
        <div className="sidebar-section-title">Configuration</div>

        <button 
          className={`sidebar-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentTab('settings')}
        >
          <Settings size={18} />
          <span>Warehouses & Locations</span>
        </button>
      </nav>

      {/* User Footer Profile & Role Toggle */}
      <div className="sidebar-user-footer">
        <div className="user-avatar">
          {currentUser.name ? currentUser.name.charAt(0) : 'U'}
        </div>
        <div className="user-meta">
          <div className="user-name">{currentUser.name}</div>
          <span className={`user-role-badge role-${currentUser.role}`}>
            {currentUser.role === 'manager' ? 'Manager' : 'Staff'}
          </span>
        </div>
        <button 
          className="icon-btn" 
          style={{ width: '30px', height: '30px' }}
          onClick={() => setCurrentTab('profile')}
          title="User Profile"
        >
          <User size={15} />
        </button>
      </div>
    </aside>
  );
}
