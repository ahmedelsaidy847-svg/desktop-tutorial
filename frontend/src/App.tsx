import React, { useState } from 'react';
import { Shell, Route } from './app/Shell';
import { Dashboard } from './app/Dashboard';
import { SalesOrdersList } from './app/SalesOrdersList';
import { SalesOrderDetail } from './app/SalesOrderDetail';

export default function App() {
  const [route, setRoute] = useState<Route>('dashboard');
  const [orderId, setOrderId] = useState<string>('1');

  return (
    <Shell current={route} onNavigate={setRoute}>
      {route === 'dashboard' && <Dashboard />}
      {route === 'sales-list' && (
        <SalesOrdersList
          onOpenOrder={(id) => {
            setOrderId(id);
            setRoute('sales-detail');
          }}
        />
      )}
      {route === 'sales-detail' && (
        <SalesOrderDetail
          orderId={orderId}
          onBack={() => setRoute('sales-list')}
        />
      )}
    </Shell>
  );
}
