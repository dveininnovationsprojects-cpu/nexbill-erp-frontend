import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "/api/customers";
const CUSTOMERS_PER_PAGE = 5;

const emptyCustomer = {
  id: "",
  name: "",
  mobile: "",
  email: "",
  city: "",
  state: "",
  pincode: "",
  gst: "",
  type: "Regular",
  status: "Active",
  address: "",
  totalOrders: 0,
  totalSpent: 0,
  lastPurchase: "",
  notes: "",
};

const CUSTOMERS_PER_PAGE = 5;

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

  const canAccess =
    role === "admin" ||
    role === "cashier" ||
    role === "ADMIN" ||
    role === "CASHIER";

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        const searchableText = `
          ${customer.id || ""}
          ${customer.name || ""}
          ${customer.mobile || ""}
          ${customer.email || ""}
          ${customer.tier || ""}
          ${customer.status || ""}
          ${customer.totalSpentAmount || ""}
          ${customer.creditLimit || ""}
          ${customer.outstandingDebt || ""}
        `.toLowerCase();

        const statusMatch =
          statusFilter === "All" ||
          String(customer.status || "").toUpperCase() === statusFilter;

        const tierMatch =
          tierFilter === "All" ||
          String(customer.tier || "").toUpperCase() === tierFilter;

        return (
          searchableText.includes(search.toLowerCase()) &&
          statusMatch &&
          tierMatch
        );
      })
      .sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
  }, [customers, search, statusFilter, tierFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE)
  );

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * CUSTOMERS_PER_PAGE;
    const endIndex = startIndex + CUSTOMERS_PER_PAGE;
    return filteredCustomers.slice(startIndex, endIndex);
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
    const possibleKeys = [
      "token",
      "authToken",
      "accessToken",
      "jwt",
      "user",
      "auth",
      "nexbill_user",
      "nexbill_auth_user",
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (!value) continue;

      try {
        const parsed = JSON.parse(value);

        if (parsed?.token) return parsed.token;
        if (parsed?.accessToken) return parsed.accessToken;
        if (parsed?.jwt) return parsed.jwt;
        if (parsed?.user?.token) return parsed.user.token;
        if (parsed?.user?.accessToken) return parsed.user.accessToken;
      } catch {
        if (value.length > 20) return value;
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
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        data ||
        `Request failed. Status: ${response.status}`;

      throw new Error(message);
    }

    return data;
  }

  async function loadCustomers() {
    if (!canAccess) return;

    try {
      setLoading(true);

      const response = await fetch(API_BASE_URL, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(response);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      setCustomers([]);
      alert(error.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }

  function handleFrontendSearch() {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      setCurrentPage(1);
      return;
    }

    const matchedCustomer = customers.find((customer) => {
      const customerText = `
        ${customer.id || ""}
        ${customer.name || ""}
        ${customer.mobile || ""}
        ${customer.email || ""}
        ${customer.tier || ""}
        ${customer.status || ""}
      `.toLowerCase();

        return (
          text.includes(search.toLowerCase()) &&
          (statusFilter === "All" || customer.status === statusFilter) &&
          (typeFilter === "All" || customer.type === typeFilter)
        );
      })
      .sort((a, b) => {
        const aNumber = Number(String(a.id || "").replace("CUS-", "")) || 0;
        const bNumber = Number(String(b.id || "").replace("CUS-", "")) || 0;
        return aNumber - bNumber;
      });
  }, [customers, search, statusFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE)
  );

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * CUSTOMERS_PER_PAGE;
    const endIndex = startIndex + CUSTOMERS_PER_PAGE;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function saveCustomers(updatedCustomers) {
    setCustomers(updatedCustomers);
    localStorage.setItem("nexbill_customers", JSON.stringify(updatedCustomers));
  }

  function money(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function nextCustomerId() {
    const max = customers.reduce((largest, customer) => {
      const number = Number(String(customer.id || "").replace("CUS-", "")) || 0;
      return Math.max(largest, number);
    }, 0);

    return `CUS-${String(max + 1).padStart(4, "0")}`;
  }

  function getCustomerSalesSummary(customer) {
    const customerId = String(customer.id || "").toLowerCase();
    const customerName = String(customer.name || "").toLowerCase().trim();
    const customerMobile = String(customer.mobile || "").toLowerCase().trim();
    const customerEmail = String(customer.email || "").toLowerCase().trim();

    const matchedSales = salesRecords.filter((sale) => {
      const saleCustomerId = String(sale.customerId || "").toLowerCase();

      const response = await fetch(
        `${API_BASE_URL}/${customer.id}/status?status=${encodeURIComponent(
          status
        )}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const updatedCustomer = await readResponse(response);

      setCustomers((previous) =>
        previous.map((item) =>
          item.id === updatedCustomer.id ? updatedCustomer : item
        )
      );

      setSelectedCustomer(updatedCustomer);
    } catch (error) {
      alert(error.message || "Unable to update customer status.");
    } finally {
      setLoading(false);
    }
  }

  async function updateLedger(event) {
    event.preventDefault();

    if (!selectedCustomer?.id) {
      alert("Select a customer first.");
      return;
    }

    const bill = Number(form.billAmount || 0);
    const paid = Number(form.paidAmount || 0);

    if (bill < 0 || paid < 0) {
      alert("Bill amount and paid amount cannot be negative.");
      return;
    }

    if (bill === 0 && paid === 0) {
      alert("Enter bill amount or paid amount.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/${selectedCustomer.id}/ledger?bill=${encodeURIComponent(
          bill
        )}&paid=${encodeURIComponent(paid)}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const updatedCustomer = await readResponse(response);

      setCustomers((previous) =>
        previous.map((item) =>
          item.id === updatedCustomer.id ? updatedCustomer : item
        )
      );

      setSelectedCustomer(updatedCustomer);
      setForm((previous) => ({
        ...previous,
        billAmount: "",
        paidAmount: "",
      }));

      alert("Ledger updated successfully.");
    } catch (error) {
      alert(error.message || "Unable to update ledger.");
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

  function saveCustomer(event) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.mobile.trim() ||
      !form.city.trim() ||
      !form.address.trim()
    ) {
      alert("Fill customer name, mobile, city and address.");
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      alert("Mobile number must be 10 digits.");
      return;
    }

    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      alert("Pincode must be 6 digits.");
      return;
    }

    if (editingId) {
      const updatedCustomer = {
        ...form,
        id: editingId,
        totalOrders: Number(form.totalOrders || 0),
        totalSpent: Number(form.totalSpent || 0),
      };

      const updated = customers.map((customer) =>
        customer.id === editingId ? updatedCustomer : customer
      );

      saveCustomers(updated);
      setSelectedCustomer(getDisplayCustomer(updatedCustomer));
      setView("details");
      return;
    }

    const newCustomer = {
      ...form,
      id: nextCustomerId(),
      totalOrders: Number(form.totalOrders || 0),
      totalSpent: Number(form.totalSpent || 0),
    };

    const updatedCustomers = [...customers, newCustomer];

    saveCustomers(updatedCustomers);
    setSelectedCustomer(getDisplayCustomer(newCustomer));
    setCurrentPage(Math.ceil(updatedCustomers.length / CUSTOMERS_PER_PAGE));
    setView("details");
  }

  if (!canAccess) {
    return (
      <section style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Access Denied</h2>
          <p style={styles.muted}>
            Only admin and cashier can access this module.
          </p>
        </div>
      </section>
    );
  }

  const totalValue = customers.reduce(
    (sum, customer) => sum + Number(customer.totalSpentAmount || 0),
    0
  );

  const activeCustomers = customers.filter(
    (customer) => String(customer.status).toUpperCase() === "ACTIVE"
  ).length;

  const premiumCustomers = customers.filter(
    (customer) => customer.type !== "Regular"
  ).length;

  const startCustomerNumber =
    filteredCustomers.length === 0
      ? 0
      : (currentPage - 1) * CUSTOMERS_PER_PAGE + 1;

  const endCustomerNumber = Math.min(
    currentPage * CUSTOMERS_PER_PAGE,
    filteredCustomers.length
  );

  return (
    <>
      <style>{`
        .nb-btn {
          transition: all 0.2s ease;
        }

        .nb-primary:hover {
          background: #C6A969 !important;
          color: #2D2D2D !important;
          border-color: #C6A969 !important;
          transform: translateY(-1px);
        }

        .nb-primary:active {
          background: #C6A969 !important;
          color: #2D2D2D !important;
          border-color: #C6A969 !important;
          transform: translateY(0);
        }

        .nb-ghost:hover {
          background: #EFE7DE !important;
          border-color: #C6A969 !important;
          color: #2D2D2D !important;
        }

        .nb-view-btn:hover {
          background: #C6A969 !important;
          color: #2D2D2D !important;
          border-color: #C6A969 !important;
          transform: translateY(-1px);
        }

        .nb-edit-btn:hover {
          background: #2D2D2D !important;
          color: #F8F5F2 !important;
          border-color: #2D2D2D !important;
          transform: translateY(-1px);
        }

        .nb-delete-btn:hover {
          background: #9B4444 !important;
          color: #FFFFFF !important;
          border-color: #9B4444 !important;
          transform: translateY(-1px);
        }

        .nb-filter-btn {
          transition: all 0.2s ease;
        }

        .nb-filter-btn:hover {
          background: #2D2D2D !important;
          color: #F8F5F2 !important;
          border-color: #2D2D2D !important;
          transform: translateY(-1px);
        }

        .nb-page-btn {
          transition: all 0.2s ease;
        }

        .nb-page-btn:hover:not(:disabled) {
          background: #2D2D2D !important;
          color: #F8F5F2 !important;
          border-color: #2D2D2D !important;
          transform: translateY(-1px);
        }

        .nb-table-row:hover td {
          background: #FFFDFB;
        }

        .nb-input:focus {
          border-color: #C6A969 !important;
          box-shadow: 0 0 0 3px rgba(198,169,105,0.13);
          background: #FFFFFF !important;
        }

        .nb-customer-search:focus-within {
          border-color: #C6A969 !important;
          box-shadow: 0 0 0 3px rgba(198,169,105,0.13);
          background: #FFFFFF !important;
        }

        @media (max-width: 900px) {
          .customer-toolbar {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .customer-filter-buttons {
            justify-content: flex-start !important;
          }

          .customer-toolbar select {
            width: 100% !important;
          }

          .customer-kpi-grid {
            grid-template-columns: 1fr !important;
          }

          .customer-form-grid {
            grid-template-columns: 1fr !important;
          }

          .customer-info-grid {
            grid-template-columns: 1fr !important;
          }

          .customer-pagination {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>

      <section style={styles.page}>
        <div style={styles.pageTitleRow}>
          <div>
            <h1 style={styles.pageTitle}>Customer Management</h1>
          </div>

          {view === "list" && (
            <button
              type="button"
              onClick={openAdd}
              className="nb-btn nb-primary"
              style={styles.primaryBtn}
              disabled={loading}
            >
              + Add Customer
            </button>
          )}
        </div>

        <div className="customer-kpi-grid" style={styles.kpiGrid}>
          <Kpi
            title="Total Customers"
            value={customers.length}
            sub="Registered buyers"
          />
          <Kpi
            title="Active Customers"
            value={activeCustomers}
            sub="Ready for billing"
          />
          <Kpi
            title="Premium Customers"
            value={premiumCustomers}
            sub="High value accounts"
          />
          <Kpi
            title="Customer Value"
            value={money(totalValue)}
            sub="Total purchase value"
          />
        </div>

        {view === "list" && (
          <div style={styles.card}>
            <div style={styles.cardHead}>
              <div>
                <h2 style={styles.cardTitle}>Customer List</h2>
                <p style={styles.muted}>
                  Showing {startCustomerNumber} - {endCustomerNumber} of{" "}
                  {filteredCustomers.length} customers
                </p>
              </div>
            </div>

            <div className="customer-toolbar" style={styles.toolbar}>
              <div className="nb-customer-search" style={styles.searchBar}>
                <span style={styles.searchIcon}>⌕</span>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customer, mobile..."
                  style={styles.searchInput}
                />
              </div>

              <div
                className="customer-filter-buttons"
                style={styles.filterButtons}
              >
                <button
                  type="button"
                  onClick={() => setStatusFilter("All")}
                  className="nb-filter-btn"
                  style={{
                    ...styles.filterBtn,
                    ...(statusFilter === "All" ? styles.filterBtnActive : {}),
                  }}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("Active")}
                  className="nb-filter-btn"
                  style={{
                    ...styles.filterBtn,
                    ...(statusFilter === "Active"
                      ? styles.filterBtnActive
                      : {}),
                  }}
                >
                  Active
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("Inactive")}
                  className="nb-filter-btn"
                  style={{
                    ...styles.filterBtn,
                    ...(statusFilter === "Inactive"
                      ? styles.filterBtnActive
                      : {}),
                  }}
                >
                  Inactive
                </button>
              </div>

              <select
                className="nb-input"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                style={styles.typeSelect}
              >
                <option>All</option>
                <option>Regular</option>
                <option>Premium</option>
                <option>Wholesale</option>
              </select>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <Th>Customer Details</Th>
                    <Th>Contact</Th>
                    <Th>Tier</Th>
                    <Th>Total Spent</Th>
                    <Th>Credit Limit</Th>
                    <Th>Outstanding</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCustomers.map((customer) => {
                    const displayCustomer = getDisplayCustomer(customer);

                    return (
                      <tr key={customer.id} className="nb-table-row">
                        <Td>
                          <b style={styles.cellMain}>{displayCustomer.name}</b>
                          <small style={styles.cellSub}>
                            {displayCustomer.id}
                          </small>
                        </Td>

                      <Td>
                        <b style={styles.cellMain}>{customer.mobile}</b>
                        <small style={styles.cellSub}>
                          {customer.email || "No email"}
                        </small>
                      </Td>

                      <Td>{formatTier(customer.tier)}</Td>
                      <Td>{money(customer.totalSpentAmount)}</Td>
                      <Td>{money(customer.creditLimit)}</Td>
                      <Td>{money(customer.outstandingDebt)}</Td>

                      <Td>
                        <Badge text={formatStatus(customer.status)} />
                      </Td>

                      <Td>
                        <div style={styles.actionGroup}>
                          <button
                            type="button"
                            className="nb-btn nb-view-btn"
                            style={styles.actionBtn}
                            onClick={() => openView(customer)}
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="nb-btn nb-edit-btn"
                            style={styles.actionBtn}
                            onClick={() => openEdit(customer)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="nb-btn nb-delete-btn"
                            style={styles.deleteBtn}
                            onClick={() => deleteCustomer(customer)}
                          >
                            Delete
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}

                  {paginatedCustomers.length === 0 && (
                  {paginatedCustomers.length === 0 && (
                    <tr>
                      <td colSpan="8" style={styles.emptyCell}>
                        {loading
                          ? "Loading customers..."
                          : "No customers found. Try name, mobile or email search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length > 0 && (
              <div className="customer-pagination" style={styles.pagination}>
                <div style={styles.pageInfo}>
                  Page {currentPage} of {totalPages} • 5 customers per page
                </div>

                <div style={styles.pageControls}>
                  <button
                    type="button"
                    className="nb-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                    style={{
                      ...styles.pageBtn,
                      ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
                    }}
                  >
                    {"<"}
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        className="nb-page-btn"
                        onClick={() => setCurrentPage(pageNumber)}
                        style={{
                          ...styles.numberBtn,
                          ...(currentPage === pageNumber
                            ? styles.numberBtnActive
                            : {}),
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="nb-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => page + 1)}
                    style={{
                      ...styles.pageBtn,
                      ...(currentPage === totalPages
                        ? styles.pageBtnDisabled
                        : {}),
                    }}
                  >
                    {">"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "form" && (
          <div style={styles.card}>
            <div style={styles.cardHead}>
              <div>
                <h2 style={styles.cardTitle}>
                  {editingId ? "Edit Customer" : "Add Customer"}
                </h2>
                <p style={styles.muted}>
                  Fill customer details supported by backend.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setView("list")}
                className="nb-btn nb-ghost"
                style={styles.ghostBtn}
              >
                Back
              </button>
            </div>

            <form
              onSubmit={saveCustomer}
              className="customer-form-grid"
              style={styles.formGrid}
            >
            <form
              onSubmit={saveCustomer}
              className="customer-form-grid"
              style={styles.formGrid}
            >
              <Input
                label="Customer Name"
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
              />

              <Input
                label="Mobile Number"
                value={form.mobile}
                onChange={(value) =>
                  setForm({
                    ...form,
                    mobile: value.replace(/\D/g, "").slice(0, 10),
                  })
                }
              />

              <Input
                label="Email"
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
              />

              <Input
                label="Credit Limit"
                value={form.creditLimit}
                onChange={(value) =>
                  setForm({
                    ...form,
                    creditLimit: value.replace(/[^\d.]/g, ""),
                  })
                }
              />

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="nb-btn nb-ghost"
                  style={styles.ghostBtn}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="nb-btn nb-primary"
                  style={styles.primaryBtn}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {view === "details" && selectedCustomer && (
          <div style={styles.card}>
            <div style={styles.cardHead}>
              <div>
                <h2 style={styles.cardTitle}>Customer Details</h2>
                <p style={styles.muted}>
                  Customer profile, credit limit, outstanding debt and ledger.
                </p>
              </div>

              <div style={styles.actionGroup}>
                <button
                  type="button"
                  className="nb-btn nb-view-btn"
                  style={styles.actionBtn}
                  onClick={() => setView("list")}
                >
                  Customer List
                </button>

                <button
                  type="button"
                  className="nb-btn nb-edit-btn"
                  style={styles.actionBtn}
                  onClick={() => openEdit(selectedCustomer)}
                >
                  Edit
                </button>
              </div>
            </div>

            <div style={styles.profileBox}>
              <div style={styles.avatarLarge}>
                {selectedCustomer.name?.slice(0, 2).toUpperCase() || "CU"}
              </div>

              <div>
                <h2 style={styles.profileTitle}>{selectedCustomer.name}</h2>
                <p style={styles.muted}>
                  {formatCustomerId(selectedCustomer.id)} •{" "}
                  {formatTier(selectedCustomer.tier)} •{" "}
                  {formatStatus(selectedCustomer.status)}
                </p>
              </div>
            </div>

            <div className="customer-info-grid" style={styles.infoGrid}>
              <Info label="Mobile" value={selectedCustomer.mobile} />
              <Info label="Email" value={selectedCustomer.email || "-"} />
              <Info label="Tier" value={formatTier(selectedCustomer.tier)} />
              <Info
                label="Total Spent"
                value={money(selectedCustomer.totalSpentAmount)}
              />
              <Info
                label="Credit Limit"
                value={money(selectedCustomer.creditLimit)}
              />
              <Info
                label="Outstanding Debt"
                value={money(selectedCustomer.outstandingDebt)}
              />
              <Info
                label="Status"
                value={formatStatus(selectedCustomer.status)}
              />
              <Info
                label="Last Credit Date"
                value={formatDateTime(selectedCustomer.lastCreditDateTime)}
              />
            </div>

            <form onSubmit={updateLedger} style={styles.ledgerBox}>
              <h3 style={styles.ledgerTitle}>Update Ledger</h3>

              <div className="customer-form-grid" style={styles.ledgerGrid}>
                <Input
                  label="Bill Amount"
                  value={form.billAmount}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      billAmount: value.replace(/[^\d.]/g, ""),
                    })
                  }
                />

                <Input
                  label="Paid Amount"
                  value={form.paidAmount}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      paidAmount: value.replace(/[^\d.]/g, ""),
                    })
                  }
                />
              </div>

              <div className="ledger-actions" style={styles.ledgerActions}>
                <button
                  type="submit"
                  className="nb-btn nb-primary"
                  style={styles.primaryBtn}
                  disabled={loading}
                >
                  Update Ledger
                </button>
              </div>
            </form>

            <div style={styles.statusBox}>
              <button
                type="button"
                className="nb-btn nb-view-btn"
                style={styles.statusActiveBtn}
                onClick={() => changeCustomerStatus(selectedCustomer, "ACTIVE")}
                disabled={loading}
              >
                Mark Active
              </button>

              <button
                type="button"
                className="nb-btn nb-delete-btn"
                style={styles.statusInactiveBtn}
                onClick={() =>
                  changeCustomerStatus(selectedCustomer, "BLACKLISTED")
                }
                disabled={loading}
              >
                Mark Inactive
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function CustomDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) || options[0];

  return (
    <div
      style={styles.customSelectWrap}
      tabIndex={0}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        style={{
          ...styles.customSelectButton,
          ...(open ? styles.customSelectButtonOpen : {}),
        }}
      >
        <span>{selected.label}</span>
        <span style={styles.customSelectArrow}>{open ? "⌃" : "⌄"}</span>
      </button>

      {open && (
        <div style={styles.customSelectMenu}>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className="nb-custom-option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  ...styles.customSelectOption,
                  ...(isSelected ? styles.customSelectOptionActive : {}),
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Kpi({ title, value, sub }) {
  return (
    <div style={styles.kpiCard}>
      <p style={styles.kpiTitle}>{title}</p>
      <h3 style={styles.kpiValue}>{value}</h3>
      <span style={styles.kpiSub}>{sub}</span>
    </div>
  );
}

function Badge({ text }) {
  return <span style={styles.badge}>{text}</span>;
}

function Input({ label, value, onChange }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <input
        className="nb-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />
    </label>
  );
}

function Info({ label, value, wide }) {
  return (
    <div
      style={{ ...styles.infoBox, ...(wide ? { gridColumn: "1 / -1" } : {}) }}
    >
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  );
}

function Th({ children }) {
  return <th style={styles.th}>{children}</th>;
}

function Td({ children }) {
  return <td style={styles.td}>{children}</td>;
}

const styles = {
  page: {
    display: "grid",
    gap: 18,
  },

  pageTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
  },

  pageTitle: {
    margin: 0,
    color: "#1F2937",
    fontSize: 22,
    letterSpacing: "-0.02em",
    fontWeight: 700,
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },

  kpiCard: {
    background: "#FFFFFF",
    border: "1px solid #EFE7DE",
    borderRadius: 14,
    boxShadow: "0 10px 24px rgba(45,45,45,0.05)",
    padding: 20,
  },

  kpiTitle: {
    margin: 0,
    color: "#8B7355",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  kpiValue: {
    margin: "10px 0 6px",
    color: "#2D2D2D",
    fontSize: 18,
    fontWeight: 700,
  },

  kpiSub: {
    color: "#7A716A",
    fontSize: 12,
    fontWeight: 400,
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid #EFE7DE",
    borderRadius: 16,
    boxShadow: "0 12px 28px rgba(45,45,45,0.05)",
    padding: 24,
  },

  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 18,
  },

  cardTitle: {
    margin: 0,
    color: "#2D2D2D",
    fontSize: 18,
    fontWeight: 700,
  },

  muted: {
    margin: "6px 0 0",
    color: "#8B7355",
    fontSize: 13,
    fontWeight: 400,
  },

  primaryBtn: {
    minHeight: 42,
    borderRadius: 10,
    border: "1px solid #2D2D2D",
    background: "#2D2D2D",
    color: "#F8F5F2",
    padding: "0 16px",
    fontWeight: 600,
    fontSize: 13,
  },

  searchBtn: {
    minHeight: 40,
    borderRadius: 10,
    border: "1px solid #2D2D2D",
    background: "#2D2D2D",
    color: "#F8F5F2",
    padding: "0 18px",
    fontWeight: 600,
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  ghostBtn: {
    minHeight: 42,
    borderRadius: 10,
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#2D2D2D",
    padding: "0 16px",
    fontWeight: 500,
    fontSize: 13,
  },

  toolbar: {
    width: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  searchBar: {
    flex: 1,
    minHeight: 40,
    display: "flex",
    alignItems: "center",
    gap: 8,
  searchBar: {
    flex: 1,
    minHeight: 40,
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    borderRadius: 10,
    padding: "0 12px",
  },

  searchIcon: {
    color: "#8B7355",
    fontSize: 15,
    fontWeight: 500,
    flexShrink: 0,
  },

  searchInput: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#3F3F46",
    minHeight: 38,
    padding: "0 12px",
  },

  searchIcon: {
    color: "#8B7355",
    fontSize: 15,
    fontWeight: 500,
    flexShrink: 0,
  },

  searchInput: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#3F3F46",
    minHeight: 38,
    outline: "none",
    fontSize: 13,
    fontWeight: 400,
  },

  filterButtons: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },

  filterBtn: {
    minHeight: 40,
    borderRadius: 9,
    border: "1px solid #EFE7DE",
    background: "#FFFFFF",
    color: "#8B7355",
    padding: "0 14px",
    fontWeight: 600,
    fontSize: 12,
  },

  filterBtnActive: {
    background: "#2D2D2D",
    borderColor: "#2D2D2D",
    color: "#F8F5F2",
  },

  typeSelect: {
    width: 125,
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#3F3F46",
    borderRadius: 9,
    minHeight: 40,
    padding: "7px 9px",
    outline: "none",
    fontSize: 12,
    fontWeight: 500,
  },

  input: {
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#3F3F46",
    borderRadius: 10,
    minHeight: 42,
    padding: "10px 14px",
    outline: "none",
    fontSize: 13,
    fontWeight: 400,
  },

  tableWrap: {
    overflowX: "auto",
    border: "1px solid #EFE7DE",
    borderRadius: 16,
  },

  table: {
    width: "100%",
    minWidth: 1000,
    borderCollapse: "collapse",
  },

  th: {
    background: "#EDE6DE",
    color: "#8B7355",
    textAlign: "left",
    padding: "14px 14px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },

  td: {
    padding: "15px 14px",
    borderTop: "1px solid #EFE7DE",
    verticalAlign: "middle",
    fontSize: 13,
    fontWeight: 500,
    color: "#2D2D2D",
  },

  cellMain: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#2D2D2D",
  },

  cellSub: {
    display: "block",
    marginTop: 3,
    fontSize: 12,
    fontWeight: 400,
    color: "#8B7355",
  },

  emptyCell: {
    padding: 40,
    textAlign: "center",
    color: "#8B7355",
    fontSize: 13,
    fontWeight: 400,
  },

  badge: {
    display: "inline-flex",
    border: "1px solid #D6D3D1",
    background: "#F8F5F2",
    color: "#8B7355",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 600,
  },

  actionGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  actionBtn: {
    minHeight: 34,
    borderRadius: 9,
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#2D2D2D",
    padding: "0 12px",
    fontWeight: 500,
    fontSize: 12,
  },

  deleteBtn: {
    minHeight: 34,
    borderRadius: 9,
    border: "1px solid #F0D0D0",
    background: "#FDF0F0",
    color: "#9B4444",
    padding: "0 12px",
    fontWeight: 500,
    fontSize: 12,
  },

  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    paddingTop: 18,
  },

  pageInfo: {
    color: "#8B7355",
    fontSize: 12,
    fontWeight: 500,
  },

  pageControls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  pageBtn: {
    minWidth: 36,
    minHeight: 36,
    borderRadius: 9,
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#2D2D2D",
    padding: "0 10px",
    fontWeight: 700,
    fontSize: 14,
  },

  pageBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  numberBtn: {
    minWidth: 36,
    minHeight: 36,
    borderRadius: 9,
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#2D2D2D",
    padding: "0 10px",
    fontWeight: 600,
    fontSize: 12,
  },

  numberBtnActive: {
    background: "#2D2D2D",
    borderColor: "#2D2D2D",
    color: "#F8F5F2",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },

  field: {
    display: "grid",
    gap: 8,
  },

  fieldLabel: {
    color: "#8B7355",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },

  formActions: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },

  profileBox: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "#F8F5F2",
    border: "1px solid #EFE7DE",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },

  avatarLarge: {
    width: 58,
    height: 58,
    display: "grid",
    placeItems: "center",
    borderRadius: 14,
    background: "#2D2D2D",
    color: "#C6A969",
    fontWeight: 700,
    fontSize: 15,
  },

  profileTitle: {
    margin: 0,
    color: "#2D2D2D",
    fontSize: 18,
    fontWeight: 700,
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },

  infoBox: {
    border: "1px solid #EFE7DE",
    background: "#FFFDFB",
    borderRadius: 12,
    padding: 15,
  },

  infoLabel: {
    display: "block",
    color: "#8B7355",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 6,
  },

  infoValue: {
    display: "block",
    color: "#2D2D2D",
    overflowWrap: "anywhere",
    fontSize: 13,
    fontWeight: 500,
  },

  ledgerBox: {
    marginTop: 26,
    padding: 22,
    border: "1px solid #EFE7DE",
    borderRadius: 14,
    background: "#FFFDFB",
  },

  ledgerTitle: {
    margin: "0 0 18px",
    color: "#2D2D2D",
    fontSize: 16,
    fontWeight: 700,
  },

  ledgerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },

  ledgerActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 24,
    paddingTop: 2,
  },

  statusBox: {
    marginTop: 20,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  statusActiveBtn: {
    minHeight: 38,
    borderRadius: 9,
    border: "1px solid #2F5D3A",
    background: "#2F5D3A",
    color: "#FFFFFF",
    padding: "0 14px",
    fontWeight: 600,
    fontSize: 12,
  },

  statusInactiveBtn: {
    minHeight: 38,
    borderRadius: 9,
    border: "1px solid #7A1F1F",
    background: "#7A1F1F",
    color: "#FFFFFF",
    padding: "0 14px",
    fontWeight: 600,
    fontSize: 12,
  },
};

export default Customers;