import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import InvoicePreview from "./pages/InvoicePreview";
import InvoiceHistory from "./pages/InvoiceHistory";

function App() {
  const isAuthenticated =
    localStorage.getItem("auth_token") ||
    import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/invoices/create"
        element={
          isAuthenticated ? (
            <CreateInvoice />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/invoices/:id"
        element={
          isAuthenticated ? (
            <InvoicePreview />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/invoices/history"
        element={
          isAuthenticated ? (
            <InvoiceHistory />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;