import React, { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

const INITIAL_WAREHOUSES = [
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
];

const INITIAL_LOCATIONS = [
  // Internal locations
  { id: 'loc-wh-stock', warehouseId: 'wh-main', name: 'WH/Stock (Main Store)', type: 'internal', path: 'WH/Stock' },
  { id: 'loc-wh-rack-a', warehouseId: 'wh-main', name: 'WH/Stock/Rack A', type: 'internal', path: 'WH/Stock/Rack A' },
  { id: 'loc-wh-rack-b', warehouseId: 'wh-main', name: 'WH/Stock/Rack B', type: 'internal', path: 'WH/Stock/Rack B' },
  { id: 'loc-wh-prod', warehouseId: 'wh-main', name: 'WH/Production Floor', type: 'internal', path: 'WH/Production' },
  { id: 'loc-wdc-stock', warehouseId: 'wh-west', name: 'WDC/Stock (Storage Bay)', type: 'internal', path: 'WDC/Stock' },
  // External & Virtual partner locations for double-entry bookkeeping
  { id: 'loc-vendors', warehouseId: null, name: 'Partner Locations/Vendors', type: 'supplier', path: 'Vendors' },
  { id: 'loc-customers', warehouseId: null, name: 'Partner Locations/Customers', type: 'customer', path: 'Customers' },
  { id: 'loc-loss', warehouseId: null, name: 'Virtual Locations/Inventory Loss', type: 'inventory_loss', path: 'Inventory Loss' }
];

const INITIAL_PRODUCTS = [
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
];

// Initial stock per (productId, locationId)
const INITIAL_STOCK_LEVELS = [
  { productId: 'prod-1', locationId: 'loc-wh-stock', qtyOnHand: 100, qtyReserved: 0 },
  { productId: 'prod-1', locationId: 'loc-wh-prod', qtyOnHand: 20, qtyReserved: 0 },
  { productId: 'prod-2', locationId: 'loc-wh-stock', qtyOnHand: 15, qtyReserved: 5 },
  { productId: 'prod-2', locationId: 'loc-wdc-stock', qtyOnHand: 8, qtyReserved: 0 },
  { productId: 'prod-3', locationId: 'loc-wh-stock', qtyOnHand: 8, qtyReserved: 0 }, // Low stock (< 15)
  { productId: 'prod-4', locationId: 'loc-wh-rack-a', qtyOnHand: 60, qtyReserved: 10 },
  { productId: 'prod-5', locationId: 'loc-wh-rack-b', qtyOnHand: 35, qtyReserved: 0 } // Low stock (< 50)
];

const INITIAL_RECEIPTS = [
  {
    id: 'rec-001',
    reference: 'WH/IN/0001',
    supplier: 'Tata Steel Tubes Ltd.',
    destinationLocationId: 'loc-wh-stock',
    scheduledDate: '2026-09-28',
    status: 'ready', // draft, waiting, ready, done, canceled
    notes: 'Urgent batch for Q3 structural frames.',
    lines: [
      { productId: 'prod-1', demandQty: 100, receivedQty: 100, uom: 'kg' }
    ],
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
    lines: [
      { productId: 'prod-3', demandQty: 50, receivedQty: 0, uom: 'Units' }
    ],
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
    lines: [
      { productId: 'prod-4', demandQty: 60, receivedQty: 60, uom: 'Pcs' }
    ],
    createdAt: '2026-09-19T09:00:00Z',
    validatedAt: '2026-09-20T11:45:00Z'
  }
];

const INITIAL_DELIVERIES = [
  {
    id: 'del-001',
    reference: 'WH/OUT/0001',
    customer: 'Apex Modern Spaces Pvt Ltd',
    sourceLocationId: 'loc-wh-stock',
    scheduledDate: '2026-09-27',
    status: 'ready', // draft, waiting, ready, done, canceled
    notes: 'Dispatch via Express Freight. Customer delivery confirmed.',
    lines: [
      { productId: 'prod-2', demandQty: 5, reservedQty: 5, doneQty: 5, uom: 'Units' }
    ],
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
    lines: [
      { productId: 'prod-2', demandQty: 10, reservedQty: 0, doneQty: 0, uom: 'Units' }
    ],
    createdAt: '2026-09-25T16:40:00Z',
    validatedAt: null
  }
];

const INITIAL_TRANSFERS = [
  {
    id: 'int-001',
    reference: 'WH/INT/0001',
    sourceLocationId: 'loc-wh-stock',
    destinationLocationId: 'loc-wh-prod',
    scheduledDate: '2026-09-26',
    status: 'ready',
    notes: 'Move raw steel bars to production floor for cutting.',
    lines: [
      { productId: 'prod-1', qty: 25, uom: 'kg' }
    ],
    createdAt: '2026-09-25T08:30:00Z',
    validatedAt: null
  },
  {
    id: 'int-002',
    reference: 'WH/INT/0002',
    sourceLocationId: 'loc-wh-stock',
    destinationLocationId: 'loc-wdc-stock',
    scheduledDate: '2026-09-29',
    status: 'draft',
    notes: 'Inter-warehouse replenishment from Pune to Navi Mumbai.',
    lines: [
      { productId: 'prod-2', qty: 5, uom: 'Units' }
    ],
    createdAt: '2026-09-26T07:10:00Z',
    validatedAt: null
  }
];

const INITIAL_ADJUSTMENTS = [
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
];

const INITIAL_MOVE_HISTORY = [
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
];

export function InventoryProvider({ children }) {
  const API_BASE = 'http://localhost:5000/api';
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Persistence state hooks
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('stocksense_user');
    return saved ? JSON.parse(saved) : {
      name: 'Aditi Sharma',
      email: 'aditi.manager@stocksense.io',
      role: 'manager', // 'manager' | 'staff'
      warehouseId: 'wh-main'
    };
  });

  const [warehouses, setWarehouses] = useState(() => {
    const saved = localStorage.getItem('stocksense_warehouses');
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('stocksense_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('stocksense_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [stockLevels, setStockLevels] = useState(() => {
    const saved = localStorage.getItem('stocksense_stock');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_LEVELS;
  });

  const [receipts, setReceipts] = useState(() => {
    const saved = localStorage.getItem('stocksense_receipts');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [deliveries, setDeliveries] = useState(() => {
    const saved = localStorage.getItem('stocksense_deliveries');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  const [transfers, setTransfers] = useState(() => {
    const saved = localStorage.getItem('stocksense_transfers');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
  });

  const [adjustments, setAdjustments] = useState(() => {
    const saved = localStorage.getItem('stocksense_adjustments');
    return saved ? JSON.parse(saved) : INITIAL_ADJUSTMENTS;
  });

  const [moveHistory, setMoveHistory] = useState(() => {
    const saved = localStorage.getItem('stocksense_moves');
    return saved ? JSON.parse(saved) : INITIAL_MOVE_HISTORY;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('stocksense_theme') || 'dark';
  });

  // Fetch initial data from local backend API
  useEffect(() => {
    async function syncFromBackend() {
      try {
        const [prodRes, stockRes, recRes, delRes, transRes, adjRes, moveRes, whRes, locRes] = await Promise.all([
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/stock`),
          fetch(`${API_BASE}/receipts`),
          fetch(`${API_BASE}/deliveries`),
          fetch(`${API_BASE}/transfers`),
          fetch(`${API_BASE}/adjustments`),
          fetch(`${API_BASE}/ledger`),
          fetch(`${API_BASE}/warehouses`),
          fetch(`${API_BASE}/locations`)
        ]);

        if (prodRes.ok) {
          const prods = await prodRes.json();
          setProducts(prods);
          setIsBackendConnected(true);
        }
        if (stockRes.ok) setStockLevels(await stockRes.json());
        if (recRes.ok) setReceipts(await recRes.json());
        if (delRes.ok) setDeliveries(await delRes.json());
        if (transRes.ok) setTransfers(await transRes.json());
        if (adjRes.ok) setAdjustments(await adjRes.json());
        if (moveRes.ok) setMoveHistory(await moveRes.json());
        if (whRes.ok) setWarehouses(await whRes.json());
        if (locRes.ok) setLocations(await locRes.json());
      } catch (err) {
        console.warn('Backend server offline or unreachable, using offline local state cache.', err);
        setIsBackendConnected(false);
      }
    }

    syncFromBackend();
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('stocksense_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('stocksense_warehouses', JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem('stocksense_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('stocksense_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('stocksense_stock', JSON.stringify(stockLevels));
  }, [stockLevels]);

  useEffect(() => {
    localStorage.setItem('stocksense_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem('stocksense_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('stocksense_transfers', JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem('stocksense_adjustments', JSON.stringify(adjustments));
  }, [adjustments]);

  useEffect(() => {
    localStorage.setItem('stocksense_moves', JSON.stringify(moveHistory));
  }, [moveHistory]);

  useEffect(() => {
    localStorage.setItem('stocksense_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Helper: Get total stock for product across all internal locations
  const getProductTotalStock = (productId) => {
    const internalLocationIds = locations.filter(l => l.type === 'internal').map(l => l.id);
    return stockLevels
      .filter(sl => sl.productId === productId && internalLocationIds.includes(sl.locationId))
      .reduce((acc, curr) => acc + (curr.qtyOnHand || 0), 0);
  };

  // Helper: Get stock for product at specific location
  const getProductStockAtLocation = (productId, locationId) => {
    const found = stockLevels.find(sl => sl.productId === productId && sl.locationId === locationId);
    return found ? found.qtyOnHand : 0;
  };

  // Helper: Get reserved stock for product across internal locations
  const getProductReservedStock = (productId) => {
    const internalLocationIds = locations.filter(l => l.type === 'internal').map(l => l.id);
    return stockLevels
      .filter(sl => sl.productId === productId && internalLocationIds.includes(sl.locationId))
      .reduce((acc, curr) => acc + (curr.qtyReserved || 0), 0);
  };

  // Helper: Update or create stock level for product at location
  const adjustStockLevel = (productId, locationId, deltaQty) => {
    setStockLevels(prev => {
      const idx = prev.findIndex(sl => sl.productId === productId && sl.locationId === locationId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          qtyOnHand: Math.max(0, updated[idx].qtyOnHand + deltaQty)
        };
        return updated;
      } else {
        return [...prev, { productId, locationId, qtyOnHand: Math.max(0, deltaQty), qtyReserved: 0 }];
      }
    });
  };

  // Log to Move History (Double Entry stock ledger)
  const logMovement = ({ reference, docType, productId, fromLocation, toLocation, quantity, uom, status = 'Done' }) => {
    const prod = products.find(p => p.id === productId);
    const newEntry = {
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
      status,
      user: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System'
    };
    setMoveHistory(prev => [newEntry, ...prev]);
  };

  // ================= Operations: Receipts =================
  const createReceipt = (receiptData) => {
    const nextNum = (receipts.length + 1).toString().padStart(4, '0');
    const newRec = {
      id: 'rec-' + Date.now(),
      reference: `WH/IN/${nextNum}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      validatedAt: null,
      ...receiptData
    };
    setReceipts(prev => [newRec, ...prev]);
    return newRec;
  };

  const updateReceiptStatus = (receiptId, newStatus) => {
    setReceipts(prev => prev.map(r => r.id === receiptId ? { ...r, status: newStatus } : r));
  };

  const validateReceipt = (receiptId) => {
    const rec = receipts.find(r => r.id === receiptId);
    if (!rec || rec.status === 'done') return false;

    const destLoc = locations.find(l => l.id === rec.destinationLocationId);
    const destName = destLoc ? destLoc.name : 'WH/Stock';

    // Increment stock for each product line
    rec.lines.forEach(line => {
      const receivedQty = Number(line.receivedQty) || Number(line.demandQty);
      adjustStockLevel(line.productId, rec.destinationLocationId, receivedQty);

      // Log to Double-entry move history
      logMovement({
        reference: rec.reference,
        docType: 'receipt',
        productId: line.productId,
        fromLocation: `Partner Locations/Vendors (${rec.supplier})`,
        toLocation: destName,
        quantity: receivedQty,
        uom: line.uom,
        status: 'Done'
      });
    });

    setReceipts(prev => prev.map(r => {
      if (r.id === receiptId) {
        return {
          ...r,
          status: 'done',
          validatedAt: new Date().toISOString(),
          lines: r.lines.map(l => ({ ...l, receivedQty: l.receivedQty || l.demandQty }))
        };
      }
      return r;
    }));
    return true;
  };

  // ================= Operations: Delivery Orders =================
  const createDelivery = (deliveryData) => {
    const nextNum = (deliveries.length + 1).toString().padStart(4, '0');
    const newDel = {
      id: 'del-' + Date.now(),
      reference: `WH/OUT/${nextNum}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      validatedAt: null,
      ...deliveryData
    };
    setDeliveries(prev => [newDel, ...prev]);
    return newDel;
  };

  const checkDeliveryAvailability = (deliveryId) => {
    const del = deliveries.find(d => d.id === deliveryId);
    if (!del) return false;

    let allAvailable = true;
    const updatedLines = del.lines.map(line => {
      const available = getProductStockAtLocation(line.productId, del.sourceLocationId);
      const reserved = Math.min(line.demandQty, available);
      if (reserved < line.demandQty) allAvailable = false;
      return {
        ...line,
        reservedQty: reserved,
        doneQty: reserved
      };
    });

    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        return {
          ...d,
          status: allAvailable ? 'ready' : 'waiting',
          lines: updatedLines
        };
      }
      return d;
    }));
    return allAvailable;
  };

  const validateDelivery = (deliveryId) => {
    const del = deliveries.find(d => d.id === deliveryId);
    if (!del || del.status === 'done') return false;

    const sourceLoc = locations.find(l => l.id === del.sourceLocationId);
    const sourceName = sourceLoc ? sourceLoc.name : 'WH/Stock';

    // Decrease stock for each product line
    del.lines.forEach(line => {
      const deliveredQty = Number(line.doneQty) || Number(line.demandQty);
      adjustStockLevel(line.productId, del.sourceLocationId, -deliveredQty);

      // Log movement to Customers
      logMovement({
        reference: del.reference,
        docType: 'delivery',
        productId: line.productId,
        fromLocation: sourceName,
        toLocation: `Partner Locations/Customers (${del.customer})`,
        quantity: -deliveredQty,
        uom: line.uom,
        status: 'Done'
      });
    });

    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        return {
          ...d,
          status: 'done',
          validatedAt: new Date().toISOString(),
          lines: d.lines.map(l => ({ ...l, doneQty: l.doneQty || l.demandQty }))
        };
      }
      return d;
    }));
    return true;
  };

  // ================= Operations: Internal Transfers =================
  const createTransfer = (transferData) => {
    const nextNum = (transfers.length + 1).toString().padStart(4, '0');
    const newTrans = {
      id: 'int-' + Date.now(),
      reference: `WH/INT/${nextNum}`,
      status: 'ready',
      createdAt: new Date().toISOString(),
      validatedAt: null,
      ...transferData
    };
    setTransfers(prev => [newTrans, ...prev]);
    return newTrans;
  };

  const validateTransfer = (transferId) => {
    const trans = transfers.find(t => t.id === transferId);
    if (!trans || trans.status === 'done') return false;

    const sourceLoc = locations.find(l => l.id === trans.sourceLocationId);
    const destLoc = locations.find(l => l.id === trans.destinationLocationId);

    trans.lines.forEach(line => {
      const qty = Number(line.qty);
      // Decrease from source
      adjustStockLevel(line.productId, trans.sourceLocationId, -qty);
      // Increase in destination
      adjustStockLevel(line.productId, trans.destinationLocationId, qty);

      // Log move
      logMovement({
        reference: trans.reference,
        docType: 'internal',
        productId: line.productId,
        fromLocation: sourceLoc ? sourceLoc.name : 'Unknown Source',
        toLocation: destLoc ? destLoc.name : 'Unknown Dest',
        quantity: qty,
        uom: line.uom,
        status: 'Done'
      });
    });

    setTransfers(prev => prev.map(t => {
      if (t.id === transferId) {
        return { ...t, status: 'done', validatedAt: new Date().toISOString() };
      }
      return t;
    }));
    return true;
  };

  // ================= Operations: Stock Adjustments =================
  const createAdjustment = ({ productId, locationId, countedQty, reason }) => {
    const recordedQty = getProductStockAtLocation(productId, locationId);
    const diff = Number(countedQty) - recordedQty;
    const nextNum = (adjustments.length + 1).toString().padStart(4, '0');
    const ref = `WH/ADJ/${nextNum}`;

    const loc = locations.find(l => l.id === locationId);
    const locName = loc ? loc.name : 'WH/Stock';

    // Update stock to exact counted quantity
    setStockLevels(prev => {
      const idx = prev.findIndex(sl => sl.productId === productId && sl.locationId === locationId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qtyOnHand: Number(countedQty) };
        return updated;
      } else {
        return [...prev, { productId, locationId, qtyOnHand: Number(countedQty), qtyReserved: 0 }];
      }
    });

    // Log to adjustments table
    const newAdj = {
      id: 'adj-' + Date.now(),
      reference: ref,
      productId,
      locationId,
      recordedQty,
      countedQty: Number(countedQty),
      difference: diff,
      reason: reason || 'Physical inventory cycle count reconciliation',
      date: new Date().toISOString(),
      status: 'done'
    };
    setAdjustments(prev => [newAdj, ...prev]);

    // Log to Double-entry move history
    const prod = products.find(p => p.id === productId);
    logMovement({
      reference: ref,
      docType: 'adjustment',
      productId,
      fromLocation: diff < 0 ? locName : 'Virtual Locations/Inventory Loss',
      toLocation: diff < 0 ? 'Virtual Locations/Inventory Loss' : locName,
      quantity: Math.abs(diff),
      uom: prod ? prod.uom : 'Units',
      status: 'Done'
    });

    return newAdj;
  };

  // ================= Product Management =================
  const createProduct = (productData) => {
    const newProd = {
      id: 'prod-' + Date.now(),
      barcode: '890' + Math.floor(100000000 + Math.random() * 900000000),
      ...productData
    };
    setProducts(prev => [newProd, ...prev]);

    if (productData.initialStock && Number(productData.initialStock) > 0) {
      const targetLoc = productData.initialLocationId || 'loc-wh-stock';
      adjustStockLevel(newProd.id, targetLoc, Number(productData.initialStock));
      logMovement({
        reference: 'INV/INIT/' + newProd.sku,
        docType: 'adjustment',
        productId: newProd.id,
        fromLocation: 'Virtual Locations/Opening Balance',
        toLocation: locations.find(l => l.id === targetLoc)?.name || 'WH/Stock',
        quantity: Number(productData.initialStock),
        uom: newProd.uom,
        status: 'Done'
      });
    }
    return newProd;
  };

  const updateProduct = (productId, updatedData) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatedData } : p));
  };

  // ================= Warehouse & Location Management =================
  const createWarehouse = (whData) => {
    const newWh = {
      id: 'wh-' + Date.now(),
      isActive: true,
      ...whData
    };
    setWarehouses(prev => [...prev, newWh]);

    // Automatically create default WH/Stock location
    const newLoc = {
      id: 'loc-' + newWh.code.toLowerCase() + '-stock',
      warehouseId: newWh.id,
      name: `${newWh.code}/Stock (Main)`,
      type: 'internal',
      path: `${newWh.code}/Stock`
    };
    setLocations(prev => [...prev, newLoc]);
    return newWh;
  };

  const createLocation = (locData) => {
    const newLoc = {
      id: 'loc-' + Date.now(),
      type: 'internal',
      ...locData
    };
    setLocations(prev => [...prev, newLoc]);
    return newLoc;
  };

  // Reset to initial demo data
  const resetDemoData = () => {
    setWarehouses(INITIAL_WAREHOUSES);
    setLocations(INITIAL_LOCATIONS);
    setProducts(INITIAL_PRODUCTS);
    setStockLevels(INITIAL_STOCK_LEVELS);
    setReceipts(INITIAL_RECEIPTS);
    setDeliveries(INITIAL_DELIVERIES);
    setTransfers(INITIAL_TRANSFERS);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setMoveHistory(INITIAL_MOVE_HISTORY);
    localStorage.clear();
  };

  // Dynamic Low stock products list
  const lowStockProducts = products.filter(p => {
    const total = getProductTotalStock(p.id);
    return total <= (p.minQty || 0);
  });

  return (
    <InventoryContext.Provider value={{
      currentUser,
      setCurrentUser,
      warehouses,
      locations,
      products,
      stockLevels,
      receipts,
      deliveries,
      transfers,
      adjustments,
      moveHistory,
      theme,
      setTheme,
      getProductTotalStock,
      getProductStockAtLocation,
      getProductReservedStock,
      createReceipt,
      updateReceiptStatus,
      validateReceipt,
      createDelivery,
      checkDeliveryAvailability,
      validateDelivery,
      createTransfer,
      validateTransfer,
      createAdjustment,
      createProduct,
      updateProduct,
      createWarehouse,
      createLocation,
      resetDemoData,
      lowStockProducts,
      isBackendConnected
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
