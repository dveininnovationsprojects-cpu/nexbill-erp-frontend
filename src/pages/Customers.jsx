import { useEffect, useMemo, useState } from "react";
import {
  Users,
  TrendingUp,
  Gem,
  IndianRupee,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

const API_BASE_URL = "/api/customers";
const CUSTOMERS_PER_PAGE = 5;

const emptyCustomer = {
  id: "",
  name: "",
  mobile: "",
  email: "",
  creditLimit: "",
  billAmount: "",
  paidAmount: "",
};

const tierOptions = [
  { label: "All", value: "All" },
  { label: "Regular", value: "REGULAR" },
  { label: "VIP", value: "VIP" },
  { label: "Corporate", value: "CORPORATE" },
];

function Customers({ role = "admin", initialCustomers = [] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCustomer);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const userRole = String(role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN";
  const isCashier = userRole === "CASHIER";

  const canAccess = isAdmin || isCashier;
  const canAddCustomer = isAdmin || isCashier;
  const canViewCustomer = isAdmin || isCashier;
  const canEditCustomer = isAdmin || isCashier;
  const canUpdateLedger = isAdmin || isCashier;
  const canChangeStatus = isAdmin || isCashier;
  const canDeleteCustomer = isAdmin;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (canAccess) {
      loadCustomers();
    }
  }, [canAccess]);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const text = `${c.id || ""} ${c.name || ""} ${c.mobile || ""} ${
          c.email || ""
        } ${c.tier || ""} ${c.status || ""} ${
          c.totalSpentAmount || ""
        } ${c.creditLimit || ""} ${c.outstandingDebt || ""}`.toLowerCase();

        const statusMatch =
          statusFilter === "All" ||
          String(c.status || "").toUpperCase() === statusFilter;

        const tierMatch =
          tierFilter === "All" ||
          String(c.tier || "").toUpperCase() === tierFilter;

        return text.includes(search.toLowerCase()) && statusMatch && tierMatch;
      })
      .sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
  }, [customers, search, statusFilter, tierFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE)
  );

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * CUSTOMERS_PER_PAGE;
    return filteredCustomers.slice(start, start + CUSTOMERS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, tierFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function getToken() {
    const keys = [
      "token",
      "authToken",
      "accessToken",
      "jwt",
      "user",
      "auth",
      "nexbill_user",
      "nexbill_auth_user",
    ];

    for (const key of keys) {
      const value = localStorage.getItem(key);

      if (!value) continue;

      try {
        const parsed = JSON.parse(value);

        if (parsed?.token) return parsed.token;
        if (parsed?.accessToken) return parsed.accessToken;
        if (parsed?.jwt) return parsed.jwt;
        if (parsed?.user?.token) return parsed.user.token;
        if (parsed?.user?.accessToken) return parsed.user.accessToken;
        if (parsed?.data?.token) return parsed.data.token;
        if (parsed?.data?.accessToken) return parsed.data.accessToken;
      } catch {
        if (value.startsWith("eyJ") || value.length > 40) {
          return value;
        }
      }
    }

    return "";
  }

  function getHeaders() {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function readResponse(response) {
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          data ||
          `Request failed: ${response.status}`
      );
    }

    return data;
  }

  async function loadCustomers() {
    if (!canAccess) return;

    try {
      setLoading(true);

      const res = await fetch(API_BASE_URL, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(res);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setCustomers([]);
      showToast(err.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }

  async function saveCustomer(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      showToast("Customer name is required.");
      return;
    }

    if (!form.mobile.trim()) {
      showToast("Mobile number is required.");
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      showToast("Mobile number must be 10 digits.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      creditLimit: Number(form.creditLimit || 0),
    };

    try {
      setLoading(true);

      if (editingId) {
        const res = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        const updated = await readResponse(res);

        setCustomers((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c))
        );

        setSelectedCustomer(updated);
        setView("details");
        showToast("Customer updated successfully.");
      } else {
        const res = await fetch(API_BASE_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        const newCustomer = await readResponse(res);

        setCustomers((prev) => [...prev, newCustomer]);
        setSelectedCustomer(newCustomer);
        setView("details");
        showToast("Customer added successfully.");
      }
    } catch (err) {
      showToast(err.message || "Unable to save customer.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCustomer(customer) {
    if (!canDeleteCustomer) {
      showToast("Only admin can delete customer.");
      return;
    }

    if (!window.confirm(`Delete ${customer.name}?`)) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/${customer.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      await readResponse(res);

      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      setView("list");
      showToast("Customer deleted.");
    } catch (err) {
      showToast(err.message || "Unable to delete customer.");
    } finally {
      setLoading(false);
    }
  }

  async function changeCustomerStatus(customer, status) {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/${customer.id}/status?status=${encodeURIComponent(
          status
        )}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const updated = await readResponse(res);

      setCustomers((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      setSelectedCustomer(updated);
      showToast(`Status updated to ${status === "ACTIVE" ? "Active" : "Inactive"}.`);
    } catch (err) {
      showToast(err.message || "Unable to update status.");
    } finally {
      setLoading(false);
    }
  }

  async function updateLedger(event) {
    event.preventDefault();

    if (!selectedCustomer?.id) {
      showToast("Select a customer first.");
      return;
    }

    const bill = Number(form.billAmount || 0);
    const paid = Number(form.paidAmount || 0);

    if (bill < 0 || paid < 0) {
      showToast("Amounts cannot be negative.");
      return;
    }

    if (bill === 0 && paid === 0) {
      showToast("Enter bill or paid amount.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/${selectedCustomer.id}/ledger?bill=${encodeURIComponent(
          bill
        )}&paid=${encodeURIComponent(paid)}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const updated = await readResponse(res);

      setCustomers((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      setSelectedCustomer(updated);
      setForm((prev) => ({
        ...prev,
        billAmount: "",
        paidAmount: "",
      }));

      showToast("Ledger updated successfully.");
    } catch (err) {
      showToast(err.message || "Unable to update ledger.");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm(emptyCustomer);
    setEditingId(null);
    setSelectedCustomer(null);
    setView("form");
  }

  function openEdit(customer) {
    setForm({
      id: customer.id || "",
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      creditLimit: customer.creditLimit ?? "",
      billAmount: "",
      paidAmount: "",
    });

    setEditingId(customer.id);
    setSelectedCustomer(customer);
    setView("form");
  }

  function openView(customer) {
    setSelectedCustomer(customer);

    setForm({
      id: customer.id || "",
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      creditLimit: customer.creditLimit ?? "",
      billAmount: "",
      paidAmount: "",
    });

    setView("details");
  }

  function money(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function formatCustomerId(id) {
    return `CUS-${String(id || 0).padStart(4, "0")}`;
  }

  function formatTier(tier) {
    const value = String(tier || "").toUpperCase();

    if (value === "VIP") return "VIP";
    if (value === "CORPORATE") return "Corporate";

    return "Regular";
  }

  function formatStatus(status) {
    const value = String(status || "").toUpperCase();

    if (value === "BLACKLISTED") return "Inactive";
    if (value === "ACTIVE") return "Active";

    return "—";
  }

  function formatDateTime(value) {
    if (!value) return "—";

    try {
      return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  }

  if (!canAccess) {
    return (
      <div className="cus-page">
        <div
          className="cus-form-card"
          style={{ padding: 32, textAlign: "center" }}
        >
          <p style={{ color: "#8B7355", fontSize: 14 }}>
            Only admin and cashier can access this module.
          </p>
        </div>
      </div>
    );
  }

  const totalValue = customers.reduce(
    (sum, c) => sum + Number(c.totalSpentAmount || 0),
    0
  );

  const activeCount = customers.filter(
    (c) => String(c.status).toUpperCase() === "ACTIVE"
  ).length;

  const inactiveCount = customers.filter(
    (c) => String(c.status).toUpperCase() === "BLACKLISTED"
  ).length;

  const premiumCount = customers.filter((c) => {
    const tier = String(c.tier || "").toUpperCase();
    return tier === "VIP" || tier === "CORPORATE";
  }).length;

  return (
    <>
      <style>{`
        .cus-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .cus-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .cus-kpi {
          background: #FFFFFF;
          border: 1px solid #EFE7DE;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 4px rgba(45,45,45,0.05);
          transition: all 0.2s;
        }

        .cus-kpi:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(45,45,45,0.08);
          border-color: #C6A969;
        }

        .cus-kpi-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cus-kpi-icon.brown {
          background: #F4EBDD;
          color: #8B7355;
        }

        .cus-kpi-icon.green {
          background: #F0F7F0;
          color: #5A7A5A;
        }

        .cus-kpi-icon.amber {
          background: #FDF8EE;
          color: #C6A969;
        }

        .cus-kpi-icon.red {
          background: #FDF0F0;
          color: #9B4444;
        }

        .cus-kpi-val {
          font-size: 22px;
          font-weight: 700;
          color: #2D2D2D;
          line-height: 1;
          margin-bottom: 3px;
        }

        .cus-kpi-label {
          font-size: 12px;
          color: #8B7355;
          font-weight: 500;
        }

        .cus-topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cus-search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .cus-search-wrap input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          border: 1.5px solid #EFE7DE;
          border-radius: 10px;
          font-size: 13px;
          background: #FFFFFF;
          outline: none;
          font-family: inherit;
          color: #2D2D2D;
          box-sizing: border-box;
        }

        .cus-search-wrap input:focus {
          border-color: #C6A969;
          box-shadow: 0 0 0 3px rgba(198,169,105,0.12);
        }

        .cus-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #8B7355;
          pointer-events: none;
        }

        .cus-filter-btns {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .cus-filter-btn {
          padding: 9px 16px;
          border: 1.5px solid #EFE7DE;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          background: #FFFFFF;
          color: #8B7355;
          transition: all 0.2s;
        }

        .cus-filter-btn:hover {
          border-color: #C6A969;
          color: #2D2D2D;
        }

        .cus-filter-btn.all.active {
          background: #2D2D2D;
          color: #F8F5F2;
          border-color: #2D2D2D;
        }

        .cus-filter-btn.ok.active {
          background: #2F5D3A;
          color: #FFFFFF;
          border-color: #2F5D3A;
        }

        .cus-filter-btn.danger.active {
          background: #7A1F1F;
          color: #FFFFFF;
          border-color: #7A1F1F;
        }

        .cus-tier-select {
          padding: 9px 14px;
          border: 1.5px solid #EFE7DE;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          background: #FFFFFF;
          color: #8B7355;
          outline: none;
          transition: all 0.2s;
          min-width: 130px;
        }

        .cus-tier-select:focus {
          border-color: #C6A969;
          box-shadow: 0 0 0 3px rgba(198,169,105,0.12);
        }

        .cus-card {
          background: #FFFFFF;
          border: 1px solid #EFE7DE;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(45,45,45,0.05);
        }

        .cus-table-scroll {
          overflow-x: auto;
        }

        .cus-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 1100px;
        }

        .cus-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 600;
          color: #8B7355;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #F8F5F2;
          border-bottom: 1px solid #EFE7DE;
        }

        .cus-table td {
          padding: 13px 16px;
          border-bottom: 1px solid #F8F5F2;
          color: #3F3F46;
          vertical-align: middle;
        }

        .cus-table tr:last-child td {
          border-bottom: none;
        }

        .cus-table tr:hover td {
          background: #FDFCFB;
        }

        .cus-id-badge {
          font-size: 11px;
          color: #8B7355;
          background: #EFE7DE;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 600;
          display: inline-block;
          margin-top: 4px;
        }

        .cus-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          display: inline-block;
          min-width: 80px;
          text-align: center;
        }

        .cus-badge-active {
          background: #F0F7F0;
          color: #5A7A5A;
        }

        .cus-badge-inactive {
          background: #FDF0F0;
          color: #9B4444;
        }

        .cus-tier-pill {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          background: #EFE7DE;
          color: #8B7355;
          display: inline-block;
        }

        .cus-tier-pill.vip {
          background: #FDF8EE;
          color: #9A7030;
        }

        .cus-tier-pill.corporate {
          background: #F0F7F0;
          color: #2F5D3A;
        }

        .cus-action-btn {
          padding: 6px 10px;
          background: #F8F5F2;
          border: 1.5px solid #EFE7DE;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 500;
          color: #3F3F46;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .cus-action-btn.view:hover {
          background: #EFE7DE;
          color: #2D2D2D;
          border-color: #C6A969;
        }

        .cus-action-btn.edit:hover {
          background: #2D2D2D;
          color: #F8F5F2;
          border-color: #2D2D2D;
        }

        .cus-action-btn.del {
          border-color: #F0D0D0;
          background: #FDF0F0;
          color: #9B4444;
        }

        .cus-action-btn.del:hover {
          background: #9B4444;
          color: #FFFFFF;
          border-color: #9B4444;
        }

        .cus-empty {
          padding: 48px;
          text-align: center;
          color: #D6D3D1;
          font-size: 14px;
        }

        .cus-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-top: 1px solid #EFE7DE;
        }

        .cus-page-info {
          font-size: 12px;
          color: #8B7355;
        }

        .cus-page-btns {
          display: flex;
          gap: 5px;
        }

        .cus-page-btn {
          min-width: 30px;
          height: 30px;
          padding: 0 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8F5F2;
          border: 1px solid #EFE7DE;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: #8B7355;
          transition: all 0.15s;
        }

        .cus-page-btn:hover:not(:disabled) {
          background: #2D2D2D;
          color: #C6A969;
          border-color: #2D2D2D;
        }

        .cus-page-btn.active {
          background: #2D2D2D;
          color: #C6A969;
          border-color: #2D2D2D;
        }

        .cus-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .cus-form-card {
          background: #FFFFFF;
          border: 1px solid #EFE7DE;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 1px 4px rgba(45,45,45,0.05);
        }

        .cus-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .cus-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cus-field label {
          font-size: 11px;
          font-weight: 600;
          color: #3F3F46;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .cus-field input {
          padding: 11px 12px;
          border: 1.5px solid #EFE7DE;
          border-radius: 9px;
          font-size: 13px;
          color: #2D2D2D;
          background: #F8F5F2;
          outline: none;
          font-family: inherit;
          transition: all 0.2s;
          width: 100%;
          box-sizing: border-box;
        }

        .cus-field input::placeholder {
          color: #9A8B7A;
          opacity: 0.85;
          font-size: 13px;
          font-weight: 400;
        }

        .cus-field input:focus {
          border-color: #C6A969;
          box-shadow: 0 0 0 3px rgba(198,169,105,0.12);
          background: #FFFFFF;
        }

        .cus-field input:focus::placeholder {
          color: transparent;
        }

        .cus-form-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        .cus-btn-primary {
          padding: 10px 24px;
          background: #2D2D2D;
          color: #F8F5F2;
          border: none;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s;
        }

        .cus-btn-primary:hover {
          background: #C6A969;
          color: #2D2D2D;
        }

        .cus-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cus-btn-ghost {
          padding: 10px 20px;
          background: #F8F5F2;
          border: 1.5px solid #EFE7DE;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          color: #8B7355;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .cus-btn-ghost:hover {
          background: #EFE7DE;
          color: #2D2D2D;
        }

        .cus-btn-add {
          padding: 9px 18px;
          background: #2D2D2D;
          color: #F8F5F2;
          border: none;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .cus-btn-add:hover {
          background: #C6A969;
          color: #2D2D2D;
        }

        .cus-detail-card {
          background: #FFFFFF;
          border: 1px solid #EFE7DE;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 1px 4px rgba(45,45,45,0.05);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .cus-profile-box {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #F8F5F2;
          border: 1px solid #EFE7DE;
          border-radius: 12px;
          padding: 16px 18px;
        }

        .cus-avatar {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #2D2D2D;
          color: #C6A969;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
        }

        .cus-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .cus-info-box {
          border: 1px solid #EFE7DE;
          background: #FFFDFB;
          border-radius: 10px;
          padding: 13px 15px;
        }

        .cus-info-label {
          display: block;
          color: #8B7355;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 5px;
        }

        .cus-info-value {
          display: block;
          color: #2D2D2D;
          font-size: 13px;
          font-weight: 500;
          overflow-wrap: anywhere;
        }

        .cus-ledger-box {
          padding: 18px;
          border: 1px solid #EFE7DE;
          border-radius: 12px;
          background: #FFFDFB;
        }

        .cus-ledger-title {
          font-size: 14px;
          font-weight: 700;
          color: #2D2D2D;
          margin: 0 0 14px;
        }

        .cus-status-box {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .cus-btn-active {
          padding: 9px 18px;
          background: #2F5D3A;
          color: #FFFFFF;
          border: none;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.2s;
        }

        .cus-btn-active:hover {
          opacity: 0.85;
        }

        .cus-btn-inactive {
          padding: 9px 18px;
          background: #7A1F1F;
          color: #FFFFFF;
          border: none;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.2s;
        }

        .cus-btn-inactive:hover {
          opacity: 0.85;
        }

        .cus-toast {
          position: fixed;
          top: 20px;
          right: 28px;
          background: #2D2D2D;
          color: #F8F5F2;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 999;
          box-shadow: 0 4px 16px rgba(45,45,45,0.2);
          animation: cusSlide 0.25s ease;
        }

        @keyframes cusSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cus-back-btn {
          padding: 6px 14px;
          background: #F8F5F2;
          border: 1.5px solid #EFE7DE;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #8B7355;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .cus-back-btn:hover {
          background: #EFE7DE;
          color: #2D2D2D;
          border-color: #C6A969;
        }

        @media (max-width: 900px) {
          .cus-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cus-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .cus-form-grid {
            grid-template-columns: 1fr;
          }

          .cus-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {toast && (
        <div className="cus-toast">
          <CheckCircle size={14} />
          {toast}
        </div>
      )}

      <div className="cus-page">
        <div className="cus-kpi-grid">
          <div className="cus-kpi">
            <div className="cus-kpi-icon brown">
              <Users size={18} />
            </div>

            <div>
              <div className="cus-kpi-val">{customers.length}</div>
              <div className="cus-kpi-label">Total Customers</div>
            </div>
          </div>

          <div className="cus-kpi">
            <div className="cus-kpi-icon green">
              <TrendingUp size={18} />
            </div>

            <div>
              <div className="cus-kpi-val">{activeCount}</div>
              <div className="cus-kpi-label">Active Customers</div>
            </div>
          </div>

          <div className="cus-kpi">
            <div className="cus-kpi-icon amber">
              <Gem size={18} />
            </div>

            <div>
              <div className="cus-kpi-val">{premiumCount}</div>
              <div className="cus-kpi-label">Premium Customers</div>
            </div>
          </div>

          <div className="cus-kpi">
            <div className="cus-kpi-icon red">
              <IndianRupee size={18} />
            </div>

            <div>
              <div className="cus-kpi-val">{money(totalValue)}</div>
              <div className="cus-kpi-label">Customer Value</div>
            </div>
          </div>
        </div>

        {view === "list" && (
          <>
            <div className="cus-topbar">
              <div className="cus-search-wrap">
                <Search size={15} className="cus-search-icon" />

                <input
                  placeholder="Search by name, mobile or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="cus-filter-btns">
                <button
                  className={`cus-filter-btn all ${
                    statusFilter === "All" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("All")}
                >
                  All
                </button>

                <button
                  className={`cus-filter-btn ok ${
                    statusFilter === "ACTIVE" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("ACTIVE")}
                >
                  Active ({activeCount})
                </button>

                <button
                  className={`cus-filter-btn danger ${
                    statusFilter === "BLACKLISTED" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("BLACKLISTED")}
                >
                  Inactive ({inactiveCount})
                </button>
              </div>

              <select
                className="cus-tier-select"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
              >
                {tierOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {canAddCustomer && (
                <button
                  className="cus-btn-add"
                  onClick={openAdd}
                  disabled={loading}
                >
                  + Add Customer
                </button>
              )}
            </div>

            <div className="cus-card">
              <div className="cus-table-scroll">
                <table className="cus-table">
                  <thead>
                    <tr>
                      <th>Customer Details</th>
                      <th>Contact</th>
                      <th>Tier</th>
                      <th>Total Spent</th>
                      <th>Credit Limit</th>
                      <th>Outstanding</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ minWidth: 220 }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="cus-empty">
                          {loading ? "Loading customers..." : "No customers found."}
                        </td>
                      </tr>
                    ) : (
                      paginatedCustomers.map((customer) => {
                        const tier = String(customer.tier || "").toUpperCase();
                        const isActive =
                          String(customer.status || "").toUpperCase() ===
                          "ACTIVE";

                        return (
                          <tr key={customer.id}>
                            <td>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "#2D2D2D",
                                  fontSize: 13,
                                }}
                              >
                                {customer.name}
                              </div>

                              <span className="cus-id-badge">
                                {formatCustomerId(customer.id)}
                              </span>
                            </td>

                            <td>
                              <div
                                style={{
                                  fontWeight: 500,
                                  color: "#2D2D2D",
                                  fontSize: 13,
                                }}
                              >
                                {customer.mobile}
                              </div>

                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#8B7355",
                                  marginTop: 2,
                                }}
                              >
                                {customer.email || "No email"}
                              </div>
                            </td>

                            <td>
                              <span
                                className={`cus-tier-pill ${
                                  tier === "VIP"
                                    ? "vip"
                                    : tier === "CORPORATE"
                                    ? "corporate"
                                    : ""
                                }`}
                              >
                                {formatTier(customer.tier)}
                              </span>
                            </td>

                            <td style={{ fontWeight: 600, color: "#2D2D2D" }}>
                              {money(customer.totalSpentAmount)}
                            </td>

                            <td style={{ color: "#8B7355" }}>
                              {money(customer.creditLimit)}
                            </td>

                            <td style={{ color: "#8B7355" }}>
                              {money(customer.outstandingDebt)}
                            </td>

                            <td style={{ textAlign: "center" }}>
                              <span
                                className={`cus-badge ${
                                  isActive
                                    ? "cus-badge-active"
                                    : "cus-badge-inactive"
                                }`}
                              >
                                {formatStatus(customer.status)}
                              </span>
                            </td>

                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 5,
                                  flexWrap: "nowrap",
                                }}
                              >
                                {canViewCustomer && (
                                  <button
                                    className="cus-action-btn view"
                                    onClick={() => openView(customer)}
                                  >
                                    <Eye size={13} />
                                    View
                                  </button>
                                )}

                                {canEditCustomer && (
                                  <button
                                    className="cus-action-btn edit"
                                    onClick={() => openEdit(customer)}
                                  >
                                    <Pencil size={13} />
                                    Edit
                                  </button>
                                )}

                                {canDeleteCustomer && (
                                  <button
                                    className="cus-action-btn del"
                                    onClick={() => deleteCustomer(customer)}
                                  >
                                    <Trash2 size={13} />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredCustomers.length > CUSTOMERS_PER_PAGE && (
                <div className="cus-pagination">
                  <span className="cus-page-info">
                    {(currentPage - 1) * CUSTOMERS_PER_PAGE + 1}–
                    {Math.min(
                      currentPage * CUSTOMERS_PER_PAGE,
                      filteredCustomers.length
                    )}{" "}
                    of {filteredCustomers.length}
                  </span>

                  <div className="cus-page-btns">
                    <button
                      className="cus-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => page - 1)}
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          className={`cus-page-btn ${
                            page === currentPage ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      className="cus-page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => page + 1)}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {view === "form" && (
          <div className="cus-form-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#2D2D2D",
                  }}
                >
                  {editingId ? "Edit Customer" : "Add Customer"}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#8B7355",
                    marginTop: 3,
                  }}
                >
                  Fill in the customer details below
                </div>
              </div>

              <button className="cus-back-btn" onClick={() => setView("list")}>
                ← Back
              </button>
            </div>

            <form onSubmit={saveCustomer} className="cus-form-grid">
              <CusInput
                label="Customer Name"
                placeholder="Enter customer name"
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
              />

              <CusInput
                label="Mobile Number"
                placeholder="Enter 10 digit mobile number"
                value={form.mobile}
                onChange={(value) =>
                  setForm({
                    ...form,
                    mobile: value.replace(/\D/g, "").slice(0, 10),
                  })
                }
              />

              <CusInput
                label="Email"
                placeholder="Enter email address"
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
              />

              <CusInput
                label="Credit Limit (₹)"
                placeholder="Enter credit limit amount"
                value={form.creditLimit}
                onChange={(value) =>
                  setForm({
                    ...form,
                    creditLimit: value.replace(/[^\d.]/g, ""),
                  })
                }
              />

              <div className="cus-form-actions">
                <button
                  type="button"
                  className="cus-btn-ghost"
                  onClick={() => setView("list")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cus-btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {view === "details" && selectedCustomer && (
          <div className="cus-detail-card">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#2D2D2D",
                  }}
                >
                  Customer Details
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#8B7355",
                    marginTop: 3,
                  }}
                >
                  Profile, credit limit, and ledger management
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="cus-back-btn"
                  onClick={() => setView("list")}
                >
                  ← Back
                </button>

                {canEditCustomer && (
                  <button
                    className="cus-action-btn edit"
                    onClick={() => openEdit(selectedCustomer)}
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="cus-profile-box">
              <div className="cus-avatar">
                {selectedCustomer.name?.slice(0, 2).toUpperCase() || "CU"}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#2D2D2D",
                  }}
                >
                  {selectedCustomer.name}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#8B7355",
                    marginTop: 4,
                  }}
                >
                  {formatCustomerId(selectedCustomer.id)} ·{" "}
                  {formatTier(selectedCustomer.tier)} ·{" "}
                  {formatStatus(selectedCustomer.status)}
                </div>
              </div>
            </div>

            <div className="cus-info-grid">
              {[
                { label: "Mobile", value: selectedCustomer.mobile || "—" },
                { label: "Email", value: selectedCustomer.email || "—" },
                { label: "Tier", value: formatTier(selectedCustomer.tier) },
                {
                  label: "Total Spent",
                  value: money(selectedCustomer.totalSpentAmount),
                },
                {
                  label: "Credit Limit",
                  value: money(selectedCustomer.creditLimit),
                },
                {
                  label: "Outstanding Debt",
                  value: money(selectedCustomer.outstandingDebt),
                },
                { label: "Status", value: formatStatus(selectedCustomer.status) },
                {
                  label: "Last Credit Date",
                  value: formatDateTime(selectedCustomer.lastCreditDateTime),
                },
              ].map((item) => (
                <div key={item.label} className="cus-info-box">
                  <span className="cus-info-label">{item.label}</span>
                  <strong className="cus-info-value">{item.value}</strong>
                </div>
              ))}
            </div>

            {canUpdateLedger && (
              <div className="cus-ledger-box">
                <div className="cus-ledger-title">Update Ledger</div>

                <form onSubmit={updateLedger} className="cus-form-grid">
                  <CusInput
                    label="Bill Amount (₹)"
                    placeholder="Enter bill amount"
                    value={form.billAmount}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        billAmount: value.replace(/[^\d.]/g, ""),
                      })
                    }
                  />

                  <CusInput
                    label="Paid Amount (₹)"
                    placeholder="Enter paid amount"
                    value={form.paidAmount}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        paidAmount: value.replace(/[^\d.]/g, ""),
                      })
                    }
                  />

                  <div className="cus-form-actions">
                    <button
                      type="submit"
                      className="cus-btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Ledger"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {canChangeStatus && (
              <div className="cus-status-box">
                <button
                  className="cus-btn-active"
                  onClick={() =>
                    changeCustomerStatus(selectedCustomer, "ACTIVE")
                  }
                  disabled={loading}
                >
                  Mark Active
                </button>

                <button
                  className="cus-btn-inactive"
                  onClick={() =>
                    changeCustomerStatus(selectedCustomer, "BLACKLISTED")
                  }
                  disabled={loading}
                >
                  Mark Inactive
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function CusInput({ label, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="cus-field">
      <label>{label}</label>

      <input
        value={value}
        placeholder={focused ? "" : placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default Customers;