import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initial seed dataset (Matching Odoo Hackathon Problem Statement)
const SEED_DATA = {
  warehouses: [
    {
      id: 'wh-main',
      code: 'WH',
      name: 'Main Central Warehouse',
      address: 'Plot 42, Industrial Zone, Pune, MH - 411019',
      isActive: true
    },
    {
      id: 'wh-west',
      code: 'WDC',
      name: 'West Distribution Center',
      address: 'Sector 9, Turbhe, Navi Mumbai, MH - 400705',
      isActive: true
    }
  ],
  locations: [
    { id: 'loc-wh-stock', warehouseId: 'wh-main', name: 'WH/Stock (Main Store)', type: 'internal', path: 'WH/Stock' },
    { id: 'loc-wh-rack-a', warehouseId: 'wh-main', name: 'WH/Stock/Rack A', type: 'internal', path: 'WH/Stock/Rack A' },
    { id: 'loc-wh-rack-b', warehouseId: 'wh-main', name: 'WH/Stock/Rack B', type: 'internal', path: 'WH/Stock/Rack B' },
    { id: 'loc-wh-prod', warehouseId: 'wh-main', name: 'WH/Production Floor', type: 'internal', path: 'WH/Production' },
    { id: 'loc-wdc-stock', warehouseId: 'wh-west', name: 'WDC/Stock (Storage Bay)', type: 'internal', path: 'WDC/Stock' },
    { id: 'loc-vendors', warehouseId: null, name: 'Partner Locations/Vendors', type: 'supplier', path: 'Vendors' },
    { id: 'loc-customers', warehouseId: null, name: 'Partner Locations/Customers', type: 'customer', path: 'Customers' },
    { id: 'loc-loss', warehouseId: null, name: 'Virtual Locations/Inventory Loss', type: 'inventory_loss', path: 'Inventory Loss' }
  ],
  products: [
    {
      id: 'prod-1',
      name: 'Steel Rods (12mm TMT)',
      sku: 'STEEL-ROD-12',
      category: 'Raw Materials',
      uom: 'kg',
      costPrice: 65,
      salePrice: 85,
      minQty: 40,
      maxQty: 250,
      description: 'High tensile reinforcement steel bars for structural fabrication.',
      barcode: '890123456701'
    },
    {
      id: 'prod-2',
      name: 'Ergonomic Wooden Chairs',
      sku: 'FURN-CHR-01',
      category: 'Finished Goods',
      uom: 'Units',
      costPrice: 1200,
      salePrice: 2200,
      minQty: 10,
      maxQty: 80,
      description: 'Solid teakwood ergonomic office and conference chair.',
      barcode: '890123456702'
    },
    {
      id: 'prod-3',
      name: 'Aluminum Extrusion Frames',
      sku: 'ALUM-FRM-40',
      category: 'Raw Materials',
      uom: 'Units',
      costPrice: 450,
      salePrice: 720,
      minQty: 15,
      maxQty: 100,
      description: 'Anodized 40x40 T-slot aluminum modular profile (2 meters).',
      barcode: '890123456703'
    },
    {
      id: 'prod-4',
      name: 'Heavy Duty Caster Wheels',
      sku: 'HD-CW-75',
      category: 'Hardware',
      uom: 'Pcs',
      costPrice: 80,
      salePrice: 145,
      minQty: 25,
      maxQty: 200,
      description: '3-inch industrial polyurethane swivel caster wheels with brake.',
      barcode: '890123456704'
    },
    {
      id: 'prod-5',
      name: 'Corrugated Packaging Boxes',
      sku: 'PKG-BOX-L',
      category: 'Packaging',
      uom: 'Units',
      costPrice: 18,
      salePrice: 32,
      minQty: 50,
      maxQty: 500,
      description: '3-ply heavy kraft cardboard master shipping cartons.',
      barcode: '890123456705'
    }
  ],
  stockLevels: [
    { productId: 'prod-1', locationId: 'loc-wh-stock', qtyOnHand: 100, qtyReserved: 0 },
    { productId: 'prod-1', locationId: 'loc-wh-prod', qtyOnHand: 20, qtyReserved: 0 },
    { productId: 'prod-2', locationId: 'loc-wh-stock', qtyOnHand: 15, qtyReserved: 5 },
    { productId: 'prod-2', locationId: 'loc-wdc-stock', qtyOnHand: 8, qtyReserved: 0 },
    { productId: 'prod-3', locationId: 'loc-wh-stock', qtyOnHand: 8, qtyReserved: 0 },
    { productId: 'prod-4', locationId: 'loc-wh-rack-a', qtyOnHand: 60, qtyReserved: 10 },
    { productId: 'prod-5', locationId: 'loc-wh-rack-b', qtyOnHand: 35, qtyReserved: 0 }
  ],
  receipts: [
    {
      id: 'rec-001',
      reference: 'WH/IN/0001',
      supplier: 'Tata Steel Tubes Ltd.',
      destinationLocationId: 'loc-wh-stock',
      scheduledDate: '2026-09-28',
      status: 'ready',
      notes: 'Urgent batch for Q3 structural frames.',
      lines: [{ productId: 'prod-1', demandQty: 100, receivedQty: 100, uom: 'kg' }],
      createdAt: '2026-09-24T10:30:00Z',
      validatedAt: null
    },
    {
      id: 'rec-002',
      reference: 'WH/IN/0002',
      supplier: 'Jindal Aluminum Fabrications',
      destinationLocationId: 'loc-wh-stock',
      scheduledDate: '2026-09-30',
      status: 'draft',
      notes: 'Replenishment for low stock frames.',
      lines: [{ productId: 'prod-3', demandQty: 50, receivedQty: 0, uom: 'Units' }],
      createdAt: '2026-09-25T14:15:00Z',
      validatedAt: null
    },
    {
      id: 'rec-000',
      reference: 'WH/IN/0000',
      supplier: 'National Hardware Supply Co.',
      destinationLocationId: 'loc-wh-rack-a',
      scheduledDate: '2026-09-20',
      status: 'done',
      notes: 'Bulk caster wheels shipment received and shelved.',
      lines: [{ productId: 'prod-4', demandQty: 60, receivedQty: 60, uom: 'Pcs' }],
      createdAt: '2026-09-19T09:00:00Z',
      validatedAt: '2026-09-20T11:45:00Z'
    }
  ],
  deliveries: [
    {
      id: 'del-001',
      reference: 'WH/OUT/0001',
      customer: 'Apex Modern Spaces Pvt Ltd',
      sourceLocationId: 'loc-wh-stock',
      scheduledDate: '2026-09-27',
      status: 'ready',
      notes: 'Dispatch via Express Freight. Customer delivery confirmed.',
      lines: [{ productId: 'prod-2', demandQty: 5, reservedQty: 5, doneQty: 5, uom: 'Units' }],
      createdAt: '2026-09-25T11:00:00Z',
      validatedAt: null
    },
    {
      id: 'del-002',
      reference: 'WH/OUT/0002',
      customer: 'Zenith Architecture Studio',
      sourceLocationId: 'loc-wh-stock',
      scheduledDate: '2026-10-02',
      status: 'waiting',
      notes: 'Awaiting remaining production batch.',
      lines: [{ productId: 'prod-2', demandQty: 10, reservedQty: 0, doneQty: 0, uom: 'Units' }],
      createdAt: '2026-09-25T16:40:00Z',
      validatedAt: null
    }
  ],
  transfers: [
    {
      id: 'int-001',
      reference: 'WH/INT/0001',
      sourceLocationId: 'loc-wh-stock',
      destinationLocationId: 'loc-wh-prod',
      scheduledDate: '2026-09-26',
      status: 'ready',
      notes: 'Move raw steel bars to production floor for cutting.',
      lines: [{ productId: 'prod-1', qty: 25, uom: 'kg' }],
      createdAt: '2026-09-25T08:30:00Z',
      validatedAt: null
    }
  ],
  adjustments: [
    {
      id: 'adj-001',
      reference: 'WH/ADJ/0001',
      productId: 'prod-1',
      locationId: 'loc-wh-stock',
      recordedQty: 103,
      countedQty: 100,
      difference: -3,
      reason: '3 kg damaged steel rods written off during quarterly audit.',
      date: '2026-09-22T15:20:00Z',
      status: 'done'
    }
  ],
  moveHistory: [
    {
      id: 'mov-1',
      date: '2026-09-20 11:45',
      reference: 'WH/IN/0000',
      docType: 'receipt',
      productName: 'Heavy Duty Caster Wheels',
      productId: 'prod-4',
      fromLocation: 'Partner Locations/Vendors',
      toLocation: 'WH/Stock/Rack A',
      quantity: 60,
      uom: 'Pcs',
      status: 'Done',
      user: 'Warehouse Staff (Raj)'
    },
    {
      id: 'mov-2',
      date: '2026-09-22 15:20',
      reference: 'WH/ADJ/0001',
      docType: 'adjustment',
      productName: 'Steel Rods (12mm TMT)',
      productId: 'prod-1',
      fromLocation: 'WH/Stock (Main Store)',
      toLocation: 'Virtual Locations/Inventory Loss',
      quantity: -3,
      uom: 'kg',
      status: 'Done',
      user: 'Inventory Manager (Aditi)'
    }
  ]
};

// Ensure data folder and db file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
}

// Read database
function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, re-seeding...', err);
    return SEED_DATA;
  }
}

// Save database atomically
function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper: Adjust stock level in memory
function adjustStock(db, productId, locationId, deltaQty) {
  const idx = db.stockLevels.findIndex(sl => sl.productId === productId && sl.locationId === locationId);
  if (idx >= 0) {
    db.stockLevels[idx].qtyOnHand = Math.max(0, db.stockLevels[idx].qtyOnHand + deltaQty);
  } else {
    db.stockLevels.push({
      productId,
      locationId,
      qtyOnHand: Math.max(0, deltaQty),
      qtyReserved: 0
    });
  }
}

// Helper: Add Move History Ledger entry
function logLedger(db, { reference, docType, productId, fromLocation, toLocation, quantity, uom, user = 'System' }) {
  const prod = db.products.find(p => p.id === productId);
  db.moveHistory.unshift({
    id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reference,
    docType,
    productName: prod ? prod.name : 'Unknown Product',
    productId,
    fromLocation,
    toLocation,
    quantity,
    uom: uom || (prod ? prod.uom : 'Units'),
    status: 'Done',
    user
  });
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'StockSense Local IMS API', timestamp: new Date() });
});

// Dashboard stats
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const internalLocIds = db.locations.filter(l => l.type === 'internal').map(l => l.id);
  
  const totalProducts = db.products.length;
  const lowStockCount = db.products.filter(p => {
    const onHand = db.stockLevels
      .filter(sl => sl.productId === p.id && internalLocIds.includes(sl.locationId))
      .reduce((acc, curr) => acc + curr.qtyOnHand, 0);
    return onHand <= (p.minQty || 0);
  }).length;

  const pendingReceipts = db.receipts.filter(r => r.status === 'ready' || r.status === 'waiting').length;
  const pendingDeliveries = db.deliveries.filter(d => d.status === 'ready' || d.status === 'waiting').length;
  const scheduledTransfers = db.transfers.filter(t => t.status === 'ready').length;

  res.json({
    totalProducts,
    lowStockCount,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers
  });
});

// Products CRUD
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = readDB();
  const newProduct = {
    id: 'prod-' + Date.now(),
    barcode: '890' + Math.floor(100000000 + Math.random() * 900000000),
    ...req.body
  };
  db.products.push(newProduct);

  if (req.body.initialStock && Number(req.body.initialStock) > 0) {
    const targetLoc = req.body.initialLocationId || 'loc-wh-stock';
    adjustStock(db, newProduct.id, targetLoc, Number(req.body.initialStock));
    logLedger(db, {
      reference: 'INV/INIT/' + newProduct.sku,
      docType: 'adjustment',
      productId: newProduct.id,
      fromLocation: 'Virtual Locations/Opening Balance',
      toLocation: db.locations.find(l => l.id === targetLoc)?.name || 'WH/Stock',
      quantity: Number(req.body.initialStock),
      uom: newProduct.uom
    });
  }

  saveDB(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Product not found' });

  db.products[idx] = { ...db.products[idx], ...req.body };
  saveDB(db);
  res.json(db.products[idx]);
});

// Stock Levels
app.get('/api/stock', (req, res) => {
  const db = readDB();
  res.json(db.stockLevels);
});

// Warehouses & Locations
app.get('/api/warehouses', (req, res) => {
  const db = readDB();
  res.json(db.warehouses);
});

app.post('/api/warehouses', (req, res) => {
  const db = readDB();
  const newWh = {
    id: 'wh-' + Date.now(),
    isActive: true,
    ...req.body
  };
  db.warehouses.push(newWh);
  // Default stock location
  db.locations.push({
    id: 'loc-' + newWh.code.toLowerCase() + '-stock',
    warehouseId: newWh.id,
    name: `${newWh.code}/Stock (Main)`,
    type: 'internal',
    path: `${newWh.code}/Stock`
  });
  saveDB(db);
  res.status(201).json(newWh);
});

app.get('/api/locations', (req, res) => {
  const db = readDB();
  res.json(db.locations);
});

app.post('/api/locations', (req, res) => {
  const db = readDB();
  const newLoc = {
    id: 'loc-' + Date.now(),
    type: 'internal',
    ...req.body
  };
  db.locations.push(newLoc);
  saveDB(db);
  res.status(201).json(newLoc);
});

// Receipts
app.get('/api/receipts', (req, res) => {
  const db = readDB();
  res.json(db.receipts);
});

app.post('/api/receipts', (req, res) => {
  const db = readDB();
  const nextNum = (db.receipts.length + 1).toString().padStart(4, '0');
  const newRec = {
    id: 'rec-' + Date.now(),
    reference: `WH/IN/${nextNum}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    validatedAt: null,
    ...req.body
  };
  db.receipts.unshift(newRec);
  saveDB(db);
  res.status(201).json(newRec);
});

app.post('/api/receipts/:id/validate', (req, res) => {
  const db = readDB();
  const rec = db.receipts.find(r => r.id === req.params.id);
  if (!rec) return res.status(404).json({ error: 'Receipt not found' });
  if (rec.status === 'done') return res.status(400).json({ error: 'Already validated' });

  const destLoc = db.locations.find(l => l.id === rec.destinationLocationId);
  const destName = destLoc ? destLoc.name : 'WH/Stock';

  rec.lines.forEach(line => {
    const qty = Number(line.receivedQty) || Number(line.demandQty);
    adjustStock(db, line.productId, rec.destinationLocationId, qty);
    logLedger(db, {
      reference: rec.reference,
      docType: 'receipt',
      productId: line.productId,
      fromLocation: `Partner Locations/Vendors (${rec.supplier})`,
      toLocation: destName,
      quantity: qty,
      uom: line.uom,
      user: req.body.user || 'Warehouse Staff'
    });
  });

  rec.status = 'done';
  rec.validatedAt = new Date().toISOString();
  saveDB(db);
  res.json(rec);
});

// Delivery Orders
app.get('/api/deliveries', (req, res) => {
  const db = readDB();
  res.json(db.deliveries);
});

app.post('/api/deliveries', (req, res) => {
  const db = readDB();
  const nextNum = (db.deliveries.length + 1).toString().padStart(4, '0');
  const newDel = {
    id: 'del-' + Date.now(),
    reference: `WH/OUT/${nextNum}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    validatedAt: null,
    ...req.body
  };
  db.deliveries.unshift(newDel);
  saveDB(db);
  res.status(201).json(newDel);
});

app.post('/api/deliveries/:id/validate', (req, res) => {
  const db = readDB();
  const del = db.deliveries.find(d => d.id === req.params.id);
  if (!del) return res.status(404).json({ error: 'Delivery order not found' });
  if (del.status === 'done') return res.status(400).json({ error: 'Already validated' });

  const sourceLoc = db.locations.find(l => l.id === del.sourceLocationId);
  const sourceName = sourceLoc ? sourceLoc.name : 'WH/Stock';

  del.lines.forEach(line => {
    const qty = Number(line.doneQty) || Number(line.demandQty);
    adjustStock(db, line.productId, del.sourceLocationId, -qty);
    logLedger(db, {
      reference: del.reference,
      docType: 'delivery',
      productId: line.productId,
      fromLocation: sourceName,
      toLocation: `Partner Locations/Customers (${del.customer})`,
      quantity: -qty,
      uom: line.uom,
      user: req.body.user || 'Warehouse Staff'
    });
  });

  del.status = 'done';
  del.validatedAt = new Date().toISOString();
  saveDB(db);
  res.json(del);
});

// Internal Transfers
app.get('/api/transfers', (req, res) => {
  const db = readDB();
  res.json(db.transfers);
});

app.post('/api/transfers', (req, res) => {
  const db = readDB();
  const nextNum = (db.transfers.length + 1).toString().padStart(4, '0');
  const newTrans = {
    id: 'int-' + Date.now(),
    reference: `WH/INT/${nextNum}`,
    status: 'ready',
    createdAt: new Date().toISOString(),
    validatedAt: null,
    ...req.body
  };
  db.transfers.unshift(newTrans);
  saveDB(db);
  res.status(201).json(newTrans);
});

app.post('/api/transfers/:id/validate', (req, res) => {
  const db = readDB();
  const trans = db.transfers.find(t => t.id === req.params.id);
  if (!trans) return res.status(404).json({ error: 'Transfer not found' });
  if (trans.status === 'done') return res.status(400).json({ error: 'Already validated' });

  const sourceLoc = db.locations.find(l => l.id === trans.sourceLocationId);
  const destLoc = db.locations.find(l => l.id === trans.destinationLocationId);

  trans.lines.forEach(line => {
    const qty = Number(line.qty);
    adjustStock(db, line.productId, trans.sourceLocationId, -qty);
    adjustStock(db, line.productId, trans.destinationLocationId, qty);
    logLedger(db, {
      reference: trans.reference,
      docType: 'internal',
      productId: line.productId,
      fromLocation: sourceLoc ? sourceLoc.name : 'Unknown',
      toLocation: destLoc ? destLoc.name : 'Unknown',
      quantity: qty,
      uom: line.uom,
      user: req.body.user || 'Warehouse Staff'
    });
  });

  trans.status = 'done';
  trans.validatedAt = new Date().toISOString();
  saveDB(db);
  res.json(trans);
});

// Stock Adjustments
app.get('/api/adjustments', (req, res) => {
  const db = readDB();
  res.json(db.adjustments);
});

app.post('/api/adjustments', (req, res) => {
  const db = readDB();
  const { productId, locationId, countedQty, reason } = req.body;
  
  const currentLevel = db.stockLevels.find(sl => sl.productId === productId && sl.locationId === locationId);
  const recordedQty = currentLevel ? currentLevel.qtyOnHand : 0;
  const difference = Number(countedQty) - recordedQty;
  const nextNum = (db.adjustments.length + 1).toString().padStart(4, '0');
  const ref = `WH/ADJ/${nextNum}`;

  // Set stock to exact counted quantity
  if (currentLevel) {
    currentLevel.qtyOnHand = Number(countedQty);
  } else {
    db.stockLevels.push({ productId, locationId, qtyOnHand: Number(countedQty), qtyReserved: 0 });
  }

  const newAdj = {
    id: 'adj-' + Date.now(),
    reference: ref,
    productId,
    locationId,
    recordedQty,
    countedQty: Number(countedQty),
    difference,
    reason: reason || 'Physical inventory cycle count',
    date: new Date().toISOString(),
    status: 'done'
  };
  db.adjustments.unshift(newAdj);

  const loc = db.locations.find(l => l.id === locationId);
  const locName = loc ? loc.name : 'WH/Stock';
  const prod = db.products.find(p => p.id === productId);

  logLedger(db, {
    reference: ref,
    docType: 'adjustment',
    productId,
    fromLocation: difference < 0 ? locName : 'Virtual Locations/Inventory Loss',
    toLocation: difference < 0 ? 'Virtual Locations/Inventory Loss' : locName,
    quantity: Math.abs(difference),
    uom: prod ? prod.uom : 'Units',
    user: req.body.user || 'Inventory Manager'
  });

  saveDB(db);
  res.status(201).json(newAdj);
});

// Stock Move History (Double-Entry Ledger)
app.get('/api/ledger', (req, res) => {
  const db = readDB();
  res.json(db.moveHistory);
});

// Reset Demo Data
app.post('/api/reset-demo', (req, res) => {
  saveDB(SEED_DATA);
  res.json({ message: 'Database reset to initial demo state successfully' });
});

app.listen(PORT, () => {
  console.log(`🚀 StockSense Local Backend API server running on http://localhost:${PORT}`);
});
