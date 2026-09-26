import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Building2, 
  Mail, 
  KeyRound, 
  Check, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function ProfileView({ onLogout }) {
  const { currentUser, setCurrentUser, warehouses } = useInventory();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState(currentUser.role);
  const [whId, setWhId] = useState(currentUser.warehouseId || warehouses[0]?.id);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setCurrentUser({
      name,
      email,
      role,
      warehouseId: whId
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <User size={24} color="var(--primary)" />
            <span>My Profile & User Role</span>
          </h1>
          <p className="page-subtitle">
            Manage your personal profile, assigned warehouse, and switch between Manager and Staff roles
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '680px' }}>
        <div className="form-sheet">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
              {name ? name.charAt(0) : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{email}</p>
              <div style={{ marginTop: '6px' }}>
                <span className={`user-role-badge role-${role}`}>
                  {role === 'manager' ? 'Inventory Manager' : 'Warehouse Staff'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">System Role</label>
                <select 
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="manager">Inventory Manager (Full Oversight & Approvals)</option>
                  <option value="staff">Warehouse Staff (Picking, Shelving, Counts)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Default Assigned Warehouse</label>
                <select 
                  className="form-select"
                  value={whId}
                  onChange={(e) => setWhId(e.target.value)}
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {savedSuccess && (
              <div style={{ background: 'var(--success-bg)', color: 'var(--success-text)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} /> Profile changes updated successfully!
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button 
                type="button" 
                className="btn btn-danger btn-sm"
                onClick={onLogout}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>

              <button type="submit" className="btn btn-primary">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
