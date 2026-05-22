import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login            from './pages/Login';
import Register         from './pages/Register';
import ForgotPassword   from './pages/ForgotPassword';
import AdminDashboard   from './pages/AdminDashboard';
import CashierDashboard from './pages/CashierDashboard';
import Products         from './pages/jsx/Products';
import Inventory        from './pages/jsx/Inventory';
import Customers        from './pages/jsx/Customers';
import Billing          from './pages/jsx/Billing';
import Payments         from './pages/jsx/Payments';
import Invoices         from './pages/jsx/Invoices';
import Reports          from './pages/jsx/Reports';
import Settings         from './pages/jsx/Settings';
import CashierBilling   from './pages/jsx/CashierBilling';
import CashierProducts  from './pages/jsx/CashierProducts';
import CashierCustomers from './pages/jsx/CashierCustomers';
import CashierInvoices  from './pages/jsx/CashierInvoices';
import CashierPayments  from './pages/jsx/CashierPayments';

function RoleRoute({ role, children }) {
  const { user } = useAuth();
  if (!user || !user.token) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/cashier/dashboard'} replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/cashier/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

          <Route path="/admin/dashboard" element={<RoleRoute role="ADMIN"><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/products"  element={<RoleRoute role="ADMIN"><Products /></RoleRoute>} />
          <Route path="/admin/inventory" element={<RoleRoute role="ADMIN"><Inventory /></RoleRoute>} />
          <Route path="/admin/customers" element={<RoleRoute role="ADMIN"><Customers /></RoleRoute>} />
          <Route path="/admin/billing"   element={<RoleRoute role="ADMIN"><Billing /></RoleRoute>} />
          <Route path="/admin/payments"  element={<RoleRoute role="ADMIN"><Payments /></RoleRoute>} />
          <Route path="/admin/invoices"  element={<RoleRoute role="ADMIN"><Invoices /></RoleRoute>} />
          <Route path="/admin/reports"   element={<RoleRoute role="ADMIN"><Reports /></RoleRoute>} />
          <Route path="/admin/settings"  element={<RoleRoute role="ADMIN"><Settings /></RoleRoute>} />

          <Route path="/cashier/dashboard" element={<RoleRoute role="CASHIER"><CashierDashboard /></RoleRoute>} />
          <Route path="/cashier/billing"   element={<RoleRoute role="CASHIER"><CashierBilling /></RoleRoute>} />
          <Route path="/cashier/products"  element={<RoleRoute role="CASHIER"><CashierProducts /></RoleRoute>} />
          <Route path="/cashier/customers" element={<RoleRoute role="CASHIER"><CashierCustomers /></RoleRoute>} />
          <Route path="/cashier/invoices"  element={<RoleRoute role="CASHIER"><CashierInvoices /></RoleRoute>} />
          <Route path="/cashier/payments"  element={<RoleRoute role="CASHIER"><CashierPayments /></RoleRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
