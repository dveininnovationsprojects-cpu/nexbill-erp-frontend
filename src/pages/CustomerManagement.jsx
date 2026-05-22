import { useEffect, useMemo, useState } from "react";

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

function CustomerManagement({ role = "admin", initialCustomers = [] }) {
  const [customers, setCustomers] = useState(() => {
    try {
      const savedCustomers = localStorage.getItem("nexbill_customers");
      return savedCustomers ? JSON.parse(savedCustomers) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [salesRecords, setSalesRecords] = useState(() => {
    try {
      const savedSales = localStorage.getItem("erp_sales_records");
      return savedSales ? JSON.parse(savedSales) : [];
    } catch {
      return [];
    }
  });

  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCustomer);

  const canAccess = role === "admin" || role === "cashier";

  useEffect(() => {
    function loadSalesRecords() {
      try {
        const savedSales = localStorage.getItem("erp_sales_records");
        setSalesRecords(savedSales ? JSON.parse(savedSales) : []);
      } catch {
        setSalesRecords([]);
      }
    }

    loadSalesRecords();

    window.addEventListener("storage", loadSalesRecords);
    window.addEventListener("focus", loadSalesRecords);

    return () => {
      window.removeEventListener("storage", loadSalesRecords);
      window.removeEventListener("focus", loadSalesRecords);
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        const text = `
          ${customer.id}
          ${customer.name}
          ${customer.mobile}
          ${customer.email}
          ${customer.city}
          ${customer.state}
          ${customer.type}
          ${customer.status}
          ${customer.gst}
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
      const saleCustomerName = String(
        sale.customer || sale.customerName || sale.buyerName || ""
      )
        .toLowerCase()
        .trim();
      const saleCustomerMobile = String(
        sale.mobile || sale.customerMobile || sale.phone || ""
      )
        .toLowerCase()
        .trim();
      const saleCustomerEmail = String(sale.email || sale.customerEmail || "")
        .toLowerCase()
        .trim();

      return (
        (customerId && saleCustomerId && saleCustomerId === customerId) ||
        (customerName && saleCustomerName && saleCustomerName === customerName) ||
        (customerMobile &&
          saleCustomerMobile &&
          saleCustomerMobile === customerMobile) ||
        (customerEmail &&
          saleCustomerEmail &&
          saleCustomerEmail === customerEmail)
      );
    });

    const totalOrders = matchedSales.length;

    const totalSpent = matchedSales.reduce((sum, sale) => {
      return (
        sum +
        Number(
          sale.revenue ||
            sale.totalAmount ||
            sale.amount ||
            sale.grandTotal ||
            sale.netAmount ||
            0
        )
      );
    }, 0);

    const lastPurchase =
      matchedSales
        .map((sale) => sale.date || sale.invoiceDate || sale.createdAt || "")
        .filter(Boolean)
        .sort()
        .reverse()[0] || "";

    return {
      totalOrders,
      totalSpent,
      lastPurchase,
      hasSales: matchedSales.length > 0,
    };
  }

  function getDisplayCustomer(customer) {
    const salesSummary = getCustomerSalesSummary(customer);

    return {
      ...customer,
      totalOrders: salesSummary.hasSales
        ? salesSummary.totalOrders
        : Number(customer.totalOrders || 0),
      totalSpent: salesSummary.hasSales
        ? salesSummary.totalSpent
        : Number(customer.totalSpent || 0),
      lastPurchase: salesSummary.hasSales
        ? salesSummary.lastPurchase
        : customer.lastPurchase || "",
    };
  }

  function openAdd() {
    setForm(emptyCustomer);
    setEditingId(null);
    setView("form");
  }

  function openEdit(customer) {
    const displayCustomer = getDisplayCustomer(customer);

    setForm(displayCustomer);
    setEditingId(customer.id);
    setSelectedCustomer(displayCustomer);
    setView("form");
  }

  function openView(customer) {
    setSelectedCustomer(getDisplayCustomer(customer));
    setView("details");
  }

  function deleteCustomer(customer) {
    if (!window.confirm(`Delete ${customer.name}?`)) return;

    const updated = customers.filter((item) => item.id !== customer.id);
    saveCustomers(updated);
    setSelectedCustomer(null);
    setView("list");
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

    saveCustomers([newCustomer, ...customers]);
    setSelectedCustomer(getDisplayCustomer(newCustomer));
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

  const customerDisplayList = customers.map(getDisplayCustomer);

  const totalValue = customerDisplayList.reduce(
    (sum, customer) => sum + Number(customer.totalSpent || 0),
    0
  );

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const premiumCustomers = customers.filter(
    (customer) => customer.type !== "Regular"
  ).length;

  return (
    <section style={styles.page}>
      <div style={styles.pageTitleRow}>
        <div>
          <h1 style={styles.pageTitle}>Customer Management</h1>
          
        </div>

        {view === "list" && (
          <button onClick={openAdd} style={styles.primaryBtn}>
            + Add Customer
          </button>
        )}
      </div>

      <div style={styles.kpiGrid}>
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
              
            </div>
          </div>

          <div style={styles.toolbar}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, mobile,"
              style={styles.input}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={styles.select}
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              style={styles.select}
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
                  <Th>Location</Th>
                  <Th>Type</Th>
                  <Th>Orders</Th>
                  <Th>Total Spent</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => {
                  const displayCustomer = getDisplayCustomer(customer);

                  return (
                    <tr key={customer.id}>
                      <Td>
                        <b style={styles.cellMain}>{displayCustomer.name}</b>
                        <small style={styles.cellSub}>
                          {displayCustomer.id}
                        </small>
                      </Td>
                      <Td>
                        <b style={styles.cellMain}>{displayCustomer.mobile}</b>
                        <small style={styles.cellSub}>
                          {displayCustomer.email || "No email"}
                        </small>
                      </Td>
                      <Td>
                        <b style={styles.cellMain}>{displayCustomer.city}</b>
                        <small style={styles.cellSub}>
                          {displayCustomer.state}
                        </small>
                      </Td>
                      <Td>{displayCustomer.type}</Td>
                      <Td>{displayCustomer.totalOrders}</Td>
                      <Td>{money(displayCustomer.totalSpent)}</Td>
                      <Td>
                        <Badge text={displayCustomer.status} />
                      </Td>
                      <Td>
                        <div style={styles.actionGroup}>
                          <button
                            style={styles.actionBtn}
                            onClick={() => openView(customer)}
                          >
                            View
                          </button>
                          <button
                            style={styles.actionBtn}
                            onClick={() => openEdit(customer)}
                          >
                            Edit
                          </button>
                          <button
                            style={styles.actionBtn}
                            onClick={() => deleteCustomer(customer)}
                          >
                            Delete
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="8" style={styles.emptyCell}>
                      No customers found. Click “Add Customer” to create a
                      customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                Total Orders and Total Spent can be entered manually. Billing
                sales will override these values when available.
              </p>
            </div>

            <button onClick={() => setView("list")} style={styles.ghostBtn}>
              Back
            </button>
          </div>

          <form onSubmit={saveCustomer} style={styles.formGrid}>
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
              label="City"
              value={form.city}
              onChange={(value) => setForm({ ...form, city: value })}
            />

            <Input
              label="State"
              value={form.state}
              onChange={(value) => setForm({ ...form, state: value })}
            />

            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(value) =>
                setForm({
                  ...form,
                  pincode: value.replace(/\D/g, "").slice(0, 6),
                })
              }
            />

            <Input
              label="Total Orders"
              value={form.totalOrders}
              onChange={(value) =>
                setForm({
                  ...form,
                  totalOrders: value.replace(/\D/g, ""),
                })
              }
            />

            <Input
              label="Total Spent"
              value={form.totalSpent}
              onChange={(value) =>
                setForm({
                  ...form,
                  totalSpent: value.replace(/[^\d.]/g, ""),
                })
              }
            />

            <label style={styles.field}>
              <span style={styles.fieldLabel}>Customer Type</span>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value })
                }
                style={styles.input}
              >
                <option>Regular</option>
                <option>Premium</option>
                <option>Wholesale</option>
              </select>
            </label>

            <label style={styles.field}>
              <span style={styles.fieldLabel}>Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
                style={styles.input}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>

            <Input
              label="GST Number"
              value={form.gst}
              onChange={(value) =>
                setForm({ ...form, gst: value.toUpperCase() })
              }
            />

            <Input
              label="Last Purchase"
              value={form.lastPurchase}
              onChange={(value) => setForm({ ...form, lastPurchase: value })}
            />

            <label style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <span style={styles.fieldLabel}>Billing Address</span>
              <textarea
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
                style={styles.textarea}
              />
            </label>

            <label style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <span style={styles.fieldLabel}>Customer Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
                style={styles.textarea}
              />
            </label>

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => setView("list")}
                style={styles.ghostBtn}
              >
                Cancel
              </button>

              <button type="submit" style={styles.primaryBtn}>
                Save Customer
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
                Complete customer profile and billing information.
              </p>
            </div>

            <div style={styles.actionGroup}>
              <button
                style={styles.actionBtn}
                onClick={() => setView("list")}
              >
                Customer List
              </button>

              <button
                style={styles.actionBtn}
                onClick={() => openEdit(selectedCustomer)}
              >
                Edit
              </button>
            </div>
          </div>

          <div style={styles.profileBox}>
            <div style={styles.avatarLarge}>
              {selectedCustomer.name.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <h2 style={styles.profileTitle}>{selectedCustomer.name}</h2>
              <p style={styles.muted}>
                {selectedCustomer.id} • {selectedCustomer.type} •{" "}
                {selectedCustomer.status}
              </p>
            </div>
          </div>

          <div style={styles.infoGrid}>
            <Info label="Mobile" value={selectedCustomer.mobile} />
            <Info label="Email" value={selectedCustomer.email || "-"} />
            <Info label="GST Number" value={selectedCustomer.gst || "-"} />
            <Info label="City" value={selectedCustomer.city} />
            <Info label="State" value={selectedCustomer.state} />
            <Info label="Pincode" value={selectedCustomer.pincode || "-"} />
            <Info label="Total Orders" value={selectedCustomer.totalOrders} />
            <Info
              label="Total Spent"
              value={money(selectedCustomer.totalSpent)}
            />
            <Info
              label="Last Purchase"
              value={selectedCustomer.lastPurchase || "-"}
            />
            <Info label="Address" value={selectedCustomer.address} wide />
            <Info
              label="Notes"
              value={selectedCustomer.notes || "No notes added"}
              wide
            />
          </div>
        </div>
      )}
    </section>
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

  pageSub: {
    display: "block",
    marginTop: 7,
    color: "#8B7355",
    fontSize: 13,
    fontWeight: 400,
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
    border: "1px solid #C6A969",
    background: "#C6A969",
    color: "#2D2D2D",
    padding: "0 16px",
    fontWeight: 600,
    fontSize: 13,
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
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
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

  select: {
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
    minWidth: 920,
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

  textarea: {
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#3F3F46",
    borderRadius: 10,
    minHeight: 92,
    padding: "10px 14px",
    outline: "none",
    resize: "vertical",
    fontSize: 13,
    fontWeight: 400,
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
};

export default CustomerManagement;