# StockSense - Technical Architecture & Hackathon Specification

## 1. System Overview
**StockSense** is an enterprise-grade, modular Inventory Management System (IMS) built for the **Odoo Hackathon**. It digitizes traditional manual registers and fragmented spreadsheets into a centralized, real-time, double-entry inventory application.

---

## 2. Evaluation Criteria Compliance

### ✅ MUST HAVE Criteria (100% Satisfied):
1. **Dynamic Data Sources (Not Static JSON):**
   - Live state machine with continuous reactivity across all modules.
   - Connected to a dedicated local Express backend API (`http://localhost:5000`) with persistent JSON/SQLite database storage (`server/data/db.json`).
   - Mutations (receipt validations, dispatches, cycle count adjustments) atomically calculate deltas and persist changes immediately.
2. **Responsive and Clean UI (Consistent Design System):**
   - Built with an Odoo 17/18-inspired enterprise design palette (`#714B67` aubergine primary, `#10B981` emerald green success, `#F59E0B` amber waiting, `#EF4444` danger).
   - Glassmorphic panels, status pill badges, dark/light theme switcher, and typography powered by *Plus Jakarta Sans*.
3. **Robust Input Validation:**
   - Enforced constraints on negative quantities, empty SKUs, matching UoMs.
   - Prevents invalid internal transfers where source location equals destination location.
   - Delivery order availability check: automatically reserves stock and flags shortages if demand exceeds on-hand quantity.
4. **Intuitive Navigation & Spacing:**
   - Left sidebar with live badge counters for pending items.
   - Odoo-style visual workflow ribbons (`[Draft] ➔ [Waiting] ➔ [Ready] ➔ [Done]`).
   - Sticky topbar with global SKU/Reference search, barcode scanner trigger, and notification drawer.
5. **Proper Git Version Control:**
   - Clean `.gitignore` and modular commit structure ready for multi-collaborator Git repositories.

---

### 🌟 NICE TO HAVE Criteria (Winning Differentiators):
1. **Local Backend API & Database Architecture:**
   - Express REST API running on port `5000` with endpoints for `/api/products`, `/api/stock`, `/api/receipts`, `/api/deliveries`, `/api/transfers`, `/api/adjustments`, and `/api/ledger`.
   - Local database persistence that does not rely on external cloud vendors.
2. **100% Offline & Local Operation:**
   - Runs locally without third-party internet dependencies or cloud latency.
3. **Double-Entry Stock Ledger (Odoo Core Principle):**
   - Every movement records a permanent audit trail from a `from_location` to a `to_location`.
   - Exportable to CSV for executive reporting.
4. **Interactive Barcode Scanner:**
   - In-app camera and laser barcode simulation for rapid SKU lookup and floor operations.
5. **Printable Official Documents:**
   - Standard-compliant Goods Receipt Note (GRN) and Delivery Challan with printable barcodes.
6. **Smart Reordering Engine:**
   - Automated min/max alert detection with 1-click replenishment draft order generation.

---

## 3. Data Models & Relationships

```
┌──────────────────┐       1:N       ┌──────────────────┐
│    Warehouse     ├─────────────────┤  Stock Location  │
└──────────────────┘                 └────────┬─────────┘
                                              │ 1:N
┌──────────────────┐       1:N       ┌────────┴─────────┐
│     Product      ├─────────────────┤   Stock Level    │
└────────┬─────────┘                 │(OnHand, Reserved)│
         │                           └──────────────────┘
         │ 1:N
┌────────┴─────────┐
│   Move History   │  ◄── Logs all: Receipts, Deliveries,
│  (Stock Ledger)  │      Internal Transfers, & Adjustments
└──────────────────┘
```

---

## 4. REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/stats` | `GET` | Dashboard KPI metrics |
| `/api/products` | `GET, POST` | Product catalog retrieval & creation |
| `/api/products/:id` | `PUT` | Update product master data & reorder rules |
| `/api/stock` | `GET` | Current stock levels per product and location |
| `/api/receipts` | `GET, POST` | Incoming goods receipts list & draft creation |
| `/api/receipts/:id/validate` | `POST` | Validates receipt, increments stock, logs ledger |
| `/api/deliveries` | `GET, POST` | Outgoing delivery orders list & creation |
| `/api/deliveries/:id/validate`| `POST` | Dispatches order, decrements stock, logs ledger |
| `/api/transfers` | `GET, POST` | Internal warehouse movement creation |
| `/api/transfers/:id/validate` | `POST` | Atomically shifts quantities between racks |
| `/api/adjustments` | `GET, POST` | Physical cycle count adjustments & loss write-offs |
| `/api/ledger` | `GET` | Complete double-entry immutable move history |
| `/api/reset-demo` | `POST` | Resets local database to initial demo state |

---

## 5. How to Run Locally

```bash
# 1. Start the local backend API server (Port 5000)
node server/server.js

# 2. In another terminal, start the frontend dev server (Port 5173)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
