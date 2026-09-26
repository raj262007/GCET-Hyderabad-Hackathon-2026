import React, { useState } from 'react';
import { 
  Search, 
  ScanBarcode, 
  Bell, 
  Moon, 
  Sun, 
  Building2, 
  ShieldCheck, 
  User, 
  LogOut, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function Navbar({ 
  onOpenScanner, 
  onOpenNotifications, 
  currentTab, 
  setCurrentTab,
  onSearch,
  searchQuery 
}) {
  const { 
    currentUser, 
    setCurrentUser, 
    warehouses, 
    theme, 
    setTheme, 
    lowStockProducts,
    resetDemoData,
    isBackendConnected 
  } = useInventory();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleRole = () => {
    setCurrentUser(prev => ({
      ...prev,
      role: prev.role === 'manager' ? 'staff' : 'manager'
    }));
  };

  const handleResetData = () => {
    if (window.confirm('Reset all inventory records to initial demo state? This will reload sample data.')) {
      resetDemoData();
      alert('Inventory reset to initial demo state!');
    }
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <div className="global-search">
          <Search className="global-search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search SKU, Product, Reference (e.g. STEEL-ROD, WH/IN/0001)..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Dynamic Backend Status Badge */}
        <div 
          className="warehouse-pill"
          style={{ 
            background: 'var(--success-bg)',
            color: 'var(--success-text)',
            borderColor: 'var(--success)',
            fontSize: '0.75rem',
            padding: '4px 10px'
          }}
          title={isBackendConnected ? "Connected to Local Express API (Port 5000)" : "Running on Reactive Cloud Engine & Local Persistence"}
        >
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: 'var(--success)',
            display: 'inline-block'
          }}></span>
          <span>{isBackendConnected ? 'Local API Live (5000)' : 'System Live (Active)'}</span>
        </div>

        {/* Quick Demo Reset Button for Judges */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={handleResetData}
          title="Reset to clean sample data"
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </button>

        {/* Barcode Scanner Modal Trigger */}
        <button 
          className="icon-btn"
          onClick={onOpenScanner}
          title="Scan SKU / Barcode"
        >
          <ScanBarcode size={18} />
        </button>

        {/* Low Stock Alert Bell */}
        <button 
          className="icon-btn"
          onClick={onOpenNotifications}
          title="Stock Alerts & Reordering"
        >
          <Bell size={18} />
          {lowStockProducts.length > 0 && (
            <span className="icon-btn-badge animate-pulse-glow">
              {lowStockProducts.length}
            </span>
          )}
        </button>

        {/* Theme Switcher */}
        <button 
          className="icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Role Switcher Pill */}
        <div 
          className="warehouse-pill"
          style={{ cursor: 'pointer' }}
          onClick={toggleRole}
          title="Click to toggle between Manager and Warehouse Staff perspective"
        >
          <ShieldCheck size={16} color={currentUser.role === 'manager' ? '#9d688f' : '#10b981'} />
          <span style={{ fontSize: '0.8rem' }}>
            {currentUser.role === 'manager' ? 'Inventory Manager' : 'Warehouse Staff'}
          </span>
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            className="user-avatar"
            style={{ cursor: 'pointer' }}
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            {currentUser.name ? currentUser.name.charAt(0) : 'U'}
          </div>

          {profileDropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '230px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '8px',
                zIndex: 50
              }}
            >
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>{currentUser.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.email}</p>
                <span className={`user-role-badge role-${currentUser.role}`} style={{ marginTop: '4px' }}>
                  {currentUser.role}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px 0' }}>
                <button 
                  className="sidebar-item" 
                  onClick={() => { setCurrentTab('profile'); setProfileDropdownOpen(false); }}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button 
                  className="sidebar-item"
                  onClick={() => {
                    localStorage.removeItem('stocksense_user');
                    window.location.reload();
                  }}
                  style={{ color: 'var(--danger)' }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
