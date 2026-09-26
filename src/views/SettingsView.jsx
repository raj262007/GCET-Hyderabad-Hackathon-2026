import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Settings, 
  Layers, 
  X,
  ExternalLink
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function SettingsView() {
  const { warehouses, locations, createWarehouse, createLocation } = useInventory();

  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);

  // New warehouse state
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  // New location state
  const [locName, setLocName] = useState('');
  const [locWhId, setLocWhId] = useState(warehouses[0]?.id || '');
  const [locType, setLocType] = useState('internal');

  const handleCreateWarehouse = (e) => {
    e.preventDefault();
    if (!whName || !whCode) {
      alert('Warehouse Name and Short Code are required.');
      return;
    }

    createWarehouse({
      name: whName,
      code: whCode.toUpperCase(),
      address: whAddress
    });

    setIsWhModalOpen(false);
    setWhName('');
    setWhCode('');
    setWhAddress('');
  };

  const handleCreateLocation = (e) => {
    e.preventDefault();
    if (!locName) {
      alert('Location Name is required.');
      return;
    }

    const wh = warehouses.find(w => w.id === locWhId);
    createLocation({
      warehouseId: locWhId,
      name: locName,
      type: locType,
      path: wh ? `${wh.code}/${locName}` : locName
    });

    setIsLocModalOpen(false);
    setLocName('');
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Building2 size={24} color="var(--primary)" />
            <span>Warehouse & Location Master Settings</span>
          </h1>
          <p className="page-subtitle">
            Configure multi-warehouse infrastructure and hierarchy of physical storage locations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsLocModalOpen(true)}>
            <Plus size={14} />
            <span>New Location</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsWhModalOpen(true)}>
            <Plus size={14} />
            <span>New Warehouse</span>
          </button>
        </div>
      </div>

      {/* Warehouses Grid */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '12px' }}>
          Registered Warehouses
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {warehouses.map(wh => {
            const whLocations = locations.filter(l => l.warehouseId === wh.id);
            return (
              <div 
                key={wh.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-ready">{wh.code}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '6px' }}>{wh.name}</h3>
                  </div>
                  <span className="badge badge-done">Active</span>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  📍 {wh.address || 'Address on file'}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    LOCATIONS IN THIS WAREHOUSE ({whLocations.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {whLocations.map(loc => (
                      <span 
                        key={loc.id}
                        style={{
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {loc.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Locations Complete Master Table */}
      <div className="table-card" style={{ marginTop: '20px' }}>
        <div className="table-toolbar">
          <strong style={{ fontSize: '1rem' }}>All Registered Inventory Locations</strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Internal storage racks, external vendor/customer nodes, and virtual loss points
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Location Name</th>
                <th>Location Type</th>
                <th>Hierarchical Path</th>
                <th>Parent Warehouse</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(loc => {
                const wh = warehouses.find(w => w.id === loc.warehouseId);
                return (
                  <tr key={loc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} color="var(--primary)" />
                        <strong>{loc.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        loc.type === 'internal' ? 'badge-ready' : 
                        loc.type === 'supplier' ? 'badge-waiting' : 
                        loc.type === 'customer' ? 'badge-done' : 'badge-draft'
                      }`}>
                        {loc.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      {loc.path}
                    </td>
                    <td>{wh ? `${wh.name} (${wh.code})` : 'Global / External'}</td>
                    <td>
                      <span className="badge badge-done">Active</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Warehouse */}
      {isWhModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Warehouse</h3>
              <button className="icon-btn" onClick={() => setIsWhModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateWarehouse}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Warehouse Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. North Distribution Hub" 
                    required
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Code *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. NDH" 
                    maxLength={5}
                    required
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Facility Address</label>
                  <textarea 
                    className="form-textarea" 
                    rows={2}
                    placeholder="Industrial Zone, City, State, PIN..."
                    value={whAddress}
                    onChange={(e) => setWhAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsWhModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Location */}
      {isLocModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Storage Location / Rack</h3>
              <button className="icon-btn" onClick={() => setIsLocModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateLocation}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Warehouse Facility *</label>
                  <select 
                    className="form-select"
                    value={locWhId}
                    onChange={(e) => setLocWhId(e.target.value)}
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location / Rack Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. WH/Stock/Rack C or Cold Storage Bay" 
                    required
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location Type</label>
                  <select 
                    className="form-select"
                    value={locType}
                    onChange={(e) => setLocType(e.target.value)}
                  >
                    <option value="internal">Internal Physical Location</option>
                    <option value="inventory_loss">Inventory Scrap / Loss</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsLocModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
