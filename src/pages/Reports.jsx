import { useMemo, useState } from "react";

function ReportsExport({ sales = [], role = "admin" }) {
  const [reportType, setReportType] = useState("Sales Report");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      return (
        (!fromDate || sale.date >= fromDate) &&
        (!toDate || sale.date <= toDate) &&
        (paymentFilter === "All" ||
          String(sale.payment || sale.paymentStatus || "").toLowerCase() ===
            paymentFilter.toLowerCase())
      );
    });
  }, [sales, fromDate, toDate, paymentFilter]);

  if (role !== "admin") {
    return (
      <section style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Access Denied</h2>
          <p style={styles.muted}>Only admin can access Reports & Export.</p>
        </div>
      </section>
    );
  }

  const totalRevenue = filteredSales.reduce(
    (sum, sale) =>
      sum + Number(sale.revenue || sale.totalAmount || sale.amount || 0),
    0
  );

  const totalGst = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.gst || sale.gstAmount || 0),
    0
  );

  const totalDiscount = filteredSales.reduce(
    (sum, sale) =>
      sum + Number(sale.discount || sale.discountAmount || 0),
    0
  );

  function exportExcel() {
    const header = [
      "Date",
      "Invoice No",
      "Customer",
      "Product",
      "Category",
      "Qty",
      "Revenue",
      "GST",
      "Discount",
      "Payment",
    ];

    const rows = filteredSales.map((sale) => [
      sale.date || "",
      sale.invoiceNo || sale.invoiceNumber || "",
      sale.customer || sale.customerName || "",
      sale.productName || sale.product || sale.itemName || "",
      sale.category || "",
      sale.quantity || sale.qty || 0,
      sale.revenue || sale.totalAmount || sale.amount || 0,
      sale.gst || sale.gstAmount || 0,
      sale.discount || sale.discountAmount || 0,
      sale.payment || sale.paymentStatus || "",
    ]);

    downloadCSV("nexbill-report.csv", [header, ...rows]);
  }

  function exportPDF() {
    window.print();
  }

  return (
    <section style={styles.page}>
      <div style={styles.pageTitleRow}>
        <div>
          <h1 style={styles.pageTitle}>Reports & Export</h1>
          
        </div>

        <div style={styles.actionGroup}>
          <button onClick={exportPDF} style={styles.ghostBtn}>
            Export PDF
          </button>

          <button onClick={exportExcel} style={styles.primaryBtn}>
            Export Excel
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHead}>
          <div>
            <h2 style={styles.cardTitle}>{reportType}</h2>
            
          </div>
        </div>

        <div style={styles.toolbar}>
          <select
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
            style={styles.select}
          >
            <option>Sales Report</option>
            <option>GST Report</option>
            <option>Customer Report</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            style={styles.input}
          />

          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            style={styles.input}
          />

          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
            style={styles.select}
          >
            <option>All</option>
            <option>Paid</option>
            <option>Pending</option>
          </select>
        </div>

        <div style={styles.kpiGrid}>
          <Kpi
            title="Total Invoices"
            value={filteredSales.length}
            sub="Filtered invoices"
          />

          <Kpi
            title="Sales Amount"
            value={money(totalRevenue)}
            sub="Total sales value"
          />

          <Kpi
            title="GST Amount"
            value={money(totalGst)}
            sub="Tax report value"
          />

          <Kpi
            title="Discount"
            value={money(totalDiscount)}
            sub="Total discount"
          />
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Invoice</Th>
                <Th>Customer</Th>
                <Th>Product</Th>
                <Th>Qty</Th>
                <Th>Revenue</Th>
                <Th>GST</Th>
                <Th>Discount</Th>
                <Th>Payment</Th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale, index) => (
                <tr key={sale.id || sale.invoiceNo || index}>
                  <Td>{sale.date || "-"}</Td>
                  <Td>{sale.invoiceNo || sale.invoiceNumber || "-"}</Td>
                  <Td>{sale.customer || sale.customerName || "-"}</Td>
                  <Td>
                    {sale.productName || sale.product || sale.itemName || "-"}
                  </Td>
                  <Td>{sale.quantity || sale.qty || 0}</Td>
                  <Td>
                    {money(
                      sale.revenue || sale.totalAmount || sale.amount || 0
                    )}
                  </Td>
                  <Td>{money(sale.gst || sale.gstAmount || 0)}</Td>
                  <Td>
                    {money(sale.discount || sale.discountAmount || 0)}
                  </Td>
                  <Td>
                    <Badge text={sale.payment || sale.paymentStatus || "-"} />
                  </Td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="9" style={styles.emptyCell}>
                    No report data found. Connect billing module sales data here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p style={styles.reportFooter}>
          Generated from NexBill ERP • Smart E-Commerce Billing & Inventory
          Management System
        </p>
      </div>
    </section>
  );
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function downloadCSV(filename, rows) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
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

  actionGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
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

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 20,
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

  reportFooter: {
    margin: "20px 0 0",
    paddingTop: 16,
    borderTop: "1px solid #EFE7DE",
    color: "#8B7355",
    fontSize: 12,
    textAlign: "center",
  },
};

export default ReportsExport;