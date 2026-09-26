import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import NotificationDrawer from './components/NotificationDrawer';

import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import ProductsView from './views/ProductsView';
import ReceiptsView from './views/ReceiptsView';
import DeliveriesView from './views/DeliveriesView';
import InternalTransfersView from './views/InternalTransfersView';
import StockAdjustmentsView from './views/StockAdjustmentsView';
import MoveHistoryView from './views/MoveHistoryView';
import ReorderingRulesView from './views/ReorderingRulesView';
import SettingsView from './views/SettingsView';
import ProfileView from './views/ProfileView';

import './App.css';

function MainApp() {
  const { currentUser, setCurrentUser } = useInventory();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Active view tab
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Search query from topbar
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Quick action states passed to views
  const [quickCreateReceipt, setQuickCreateReceipt] = useState(false);
  const [quickCreateDelivery, setQuickCreateDelivery] = useState(false);
  const [quickCreateTransfer, setQuickCreateTransfer] = useState(false);
  const [preselectedProductForAdj, setPreselectedProductForAdj] = useState(null);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
  };

  // Scanner action shortcut
  const handleScannerAction = (actionType, product) => {
    if (actionType === 'receipt') {
      setCurrentTab('receipts');
      setQuickCreateReceipt(true);
    } else if (actionType === 'delivery') {
      setCurrentTab('deliveries');
      setQuickCreateDelivery(true);
    } else if (actionType === 'adjustment') {
      setPreselectedProductForAdj(product);
      setCurrentTab('adjustments');
    }
  };

  if (!isAuthenticated) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Odoo Style Left Navigation Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setQuickCreateReceipt(false);
          setQuickCreateDelivery(false);
          setQuickCreateTransfer(false);
        }} 
      />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Top Navbar */}
        <Navbar 
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          searchQuery={searchQuery}
          onSearch={(q) => setSearchQuery(q)}
        />

        {/* Dynamic Route View */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {currentTab === 'dashboard' && (
            <DashboardView 
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenNewReceipt={() => {
                setQuickCreateReceipt(true);
                setCurrentTab('receipts');
              }}
              onOpenNewDelivery={() => {
                setQuickCreateDelivery(true);
                setCurrentTab('deliveries');
              }}
              onOpenNewTransfer={() => {
                setQuickCreateTransfer(true);
                setCurrentTab('transfers');
              }}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView 
              initialSearchQuery={searchQuery}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {currentTab === 'receipts' && (
            <ReceiptsView 
              initialCreateOpen={quickCreateReceipt}
            />
          )}

          {currentTab === 'deliveries' && (
            <DeliveriesView 
              initialCreateOpen={quickCreateDelivery}
            />
          )}

          {currentTab === 'transfers' && (
            <InternalTransfersView 
              initialCreateOpen={quickCreateTransfer}
            />
          )}

          {currentTab === 'adjustments' && (
            <StockAdjustmentsView 
              preselectedProduct={preselectedProductForAdj}
            />
          )}

          {currentTab === 'reordering' && (
            <ReorderingRulesView 
              onNavigateToReceipts={() => setCurrentTab('receipts')}
            />
          )}

          {currentTab === 'moves' && (
            <MoveHistoryView />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}

          {currentTab === 'profile' && (
            <ProfileView onLogout={handleLogout} />
          )}
        </div>
      </main>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectAction={handleScannerAction}
      />

      {/* Low Stock Reorder Drawer */}
      <NotificationDrawer 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToReceipts={() => setCurrentTab('receipts')}
      />
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <MainApp />
    </InventoryProvider>
  );
}
