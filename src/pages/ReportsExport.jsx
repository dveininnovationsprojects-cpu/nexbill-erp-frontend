import { useMemo, useState } from "react";

function ReportsExport({ sales = [], role = "admin" }) {
  const [reportType, setReportType] = useState("Sales Report");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const isAdmin = role === "admin" || role === "ADMIN";

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
    (sum, sale) => sum + Number(sale.discount || sale.discountAmount || 0),
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

  function getPrintTableHtml() {
    const rows = filteredSales
      .map(
        (sale) => `
          <tr>
            <td>${escapeHtml(sale.date || "-")}</td>
            <td>${escapeHtml(sale.invoiceNo || sale.invoiceNumber || "-")}</td>
            <td>${escapeHtml(sale.customer || sale.customerName || "-")}</td>
            <td>${escapeHtml(
              sale.productName || sale.product || sale.itemName || "-"
            )}</td>
            <td>${escapeHtml(sale.quantity || sale.qty || 0)}</td>
            <td>${money(sale.revenue || sale.totalAmount || sale.amount || 0)}</td>
            <td>${money(sale.gst || sale.gstAmount || 0)}</td>
            <td>${money(sale.discount || sale.discountAmount || 0)}</td>
            <td>${escapeHtml(sale.payment || sale.paymentStatus || "-")}</td>
          </tr>
        `
      )
      .join("");

    return `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Revenue</th>
            <th>GST</th>
            <th>Discount</th>
            <th>Payment</th>
          </tr>
        </thead>

        <tbody>
          ${
            rows ||
            `<tr>
              <td colspan="9" class="empty">
                No report data found for selected date range.
              </td>
            </tr>`
          }
        </tbody>
      </table>
    `;
  }

  function exportPDF() {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NexBill ERP - ${escapeHtml(reportType)}</title>

          <style>
            * {
              box-sizing: border-box;
              font-family: Arial, sans-serif;
            }

            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #1f2937;
            }

            .report-page {
              width: 100%;
              max-width: 1050px;
              margin: 0 auto;
              padding: 28px;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 20px;
              border-bottom: 2px solid #c6a969;
              padding-bottom: 18px;
              margin-bottom: 22px;
            }

            .brand {
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .logo {
              width: 46px;
              height: 46px;
              border-radius: 12px;
              background: #2d2d2d;
              color: #c6a969;
              display: grid;
              place-items: center;
              font-weight: 700;
              font-size: 20px;
            }

            h1 {
              margin: 0;
              color: #2d2d2d;
              font-size: 25px;
              font-weight: 700;
            }

            .subtitle {
              margin: 6px 0 0;
              color: #8b7355;
              font-size: 13px;
            }

            .meta {
              text-align: right;
              color: #8b7355;
              font-size: 12px;
              line-height: 1.8;
              min-width: 220px;
            }

            .report-title {
              background: #fffdfb;
              border: 1px solid #efe7de;
              border-radius: 14px;
              padding: 18px;
              margin-bottom: 20px;
            }

            .report-title h2 {
              margin: 0;
              font-size: 20px;
              color: #2d2d2d;
            }

            .report-title p {
              margin: 8px 0 0;
              color: #8b7355;
              font-size: 13px;
            }

            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 14px;
              margin-bottom: 24px;
            }

            .summary-card {
              border: 1px solid #efe7de;
              border-radius: 14px;
              padding: 16px;
              background: #fffdfb;
            }

            .summary-card span {
              display: block;
              color: #8b7355;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              margin-bottom: 10px;
            }

            .summary-card strong {
              display: block;
              color: #2d2d2d;
              font-size: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 14px;
            }

            th {
              background: #ede6de;
              color: #8b7355;
              text-align: left;
              padding: 12px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              border: 1px solid #efe7de;
            }

            td {
              border: 1px solid #efe7de;
              padding: 12px;
              font-size: 12px;
              color: #2d2d2d;
            }

            .empty {
              text-align: center;
              color: #8b7355;
              padding: 28px;
            }

            .footer {
              margin-top: 30px;
              text-align: center;
              color: #8b7355;
              font-size: 12px;
              border-top: 1px solid #efe7de;
              padding-top: 14px;
            }

            @page {
              size: A4 landscape;
              margin: 12mm;
            }

            @media print {
              body {
                padding: 0;
              }

              .report-page {
                max-width: 100%;
                padding: 0;
              }
            }
          </style>
        </head>

        <body>
          <div class="report-page">
            <div class="header">
              <div class="brand">
                <div class="logo">N</div>

                <div>
                  <h1>NexBill ERP</h1>
                  <p class="subtitle">
                    Smart E-Commerce Billing & Inventory Management System
                  </p>
                </div>
              </div>

              <div class="meta">
                <div><b>Report:</b> ${escapeHtml(reportType)}</div>
                <div><b>From:</b> ${formatDisplayDate(fromDate)}</div>
                <div><b>To:</b> ${formatDisplayDate(toDate)}</div>
                <div><b>Payment:</b> ${escapeHtml(paymentFilter)}</div>
                <div><b>Generated:</b> ${new Date().toLocaleString("en-IN")}</div>
              </div>
            </div>

            <div class="report-title">
              <h2>${escapeHtml(reportType)}</h2>
              <p>
                Report generated for selected date range from
                ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}.
              </p>
            </div>

            <div class="summary-grid">
              <div class="summary-card">
                <span>Total Invoices</span>
                <strong>${filteredSales.length}</strong>
              </div>

              <div class="summary-card">
                <span>Sales Amount</span>
                <strong>${money(totalRevenue)}</strong>
              </div>

              <div class="summary-card">
                <span>GST Amount</span>
                <strong>${money(totalGst)}</strong>
              </div>

              <div class="summary-card">
                <span>Discount</span>
                <strong>${money(totalDiscount)}</strong>
              </div>
            </div>

            ${getPrintTableHtml()}

            <div class="footer">
              Generated from NexBill ERP • Smart E-Commerce Billing & Inventory Management System
            </div>
          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.focus();
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1100,height=800");

    if (!printWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  if (!isAdmin) {
    return (
      <section style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Access Denied</h2>
          <p style={styles.muted}>Only admin can access Reports & Export.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        .nb-btn {
          transition: all 0.2s ease;
        }

        .nb-primary:hover {
          background: #2D2D2D !important;
          color: #F8F5F2 !important;
          border-color: #2D2D2D !important;
          transform: translateY(-1px);
        }

        .nb-ghost:hover {
          background: #C6A969 !important;
          border-color: #C6A969 !important;
          color: #2D2D2D !important;
          transform: translateY(-1px);
        }

        .nb-input:focus {
          border-color: #C6A969 !important;
          box-shadow: 0 0 0 3px rgba(198,169,105,0.13);
          background: #FFFFFF !important;
        }

        .nb-report-search:focus-within {
          border-color: #C6A969 !important;
          box-shadow: 0 0 0 3px rgba(198,169,105,0.13);
          background: #FFFFFF !important;
        }

        .nb-table-row:hover td {
          background: #FFFDFB;
        }

        .nb-kpi-card {
          transition: all 0.2s ease;
        }

        .nb-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(45,45,45,0.08) !important;
          border-color: #C6A969 !important;
        }

        .nb-report-card {
          transition: all 0.2s ease;
        }

        .nb-report-card:hover {
          box-shadow: 0 16px 34px rgba(45,45,45,0.08) !important;
        }

        .nb-badge:hover {
          background: #2D2D2D !important;
          color: #F8F5F2 !important;
          border-color: #2D2D2D !important;
        }

        @media (max-width: 900px) {
          .reports-toolbar {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .reports-toolbar input,
          .reports-toolbar select {
            width: 100% !important;
          }

          .reports-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <section style={styles.page}>
        <div style={styles.pageTitleRow}>
          <div>
            <h1 style={styles.pageTitle}>Reports & Export</h1>
          </div>

          <div style={styles.actionGroup}>
            <button
              type="button"
              onClick={exportPDF}
              className="nb-btn nb-ghost"
              style={styles.ghostBtn}
            >
              Export PDF
            </button>

            <button
              type="button"
              onClick={exportExcel}
              className="nb-btn nb-primary"
              style={styles.primaryBtn}
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="nb-report-card" style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <h2 style={styles.cardTitle}>{reportType}</h2>
            </div>
          </div>

          <div className="reports-toolbar" style={styles.toolbar}>
            <div className="nb-report-search" style={styles.searchBar}>
              <span style={styles.searchIcon}>⌕</span>

              <select
                value={reportType}
                onChange={(event) => setReportType(event.target.value)}
                style={styles.reportSelect}
              >
                <option>Sales Report</option>
                <option>GST Report</option>
                <option>Customer Report</option>
              </select>
            </div>

            <input
              className="nb-input"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              style={styles.dateInput}
            />

            <input
              className="nb-input"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              style={styles.dateInput}
            />

            <select
              className="nb-input"
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
              style={styles.paymentSelect}
            >
              <option>All</option>
              <option>Paid</option>
              <option>Pending</option>
            </select>
          </div>

          <div className="reports-kpi-grid" style={styles.kpiGrid}>
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
                  <tr
                    key={sale.id || sale.invoiceNo || index}
                    className="nb-table-row"
                  >
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
                      No report data found. Connect billing module sales data
                      here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          
        </div>
      </section>
    </>
  );
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDisplayDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function downloadCSV(filename, rows) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

function Kpi({ title, value, sub }) {
  return (
    <div className="nb-kpi-card" style={styles.kpiCard}>
      <p style={styles.kpiTitle}>{title}</p>
      <h3 style={styles.kpiValue}>{value}</h3>
      <span style={styles.kpiSub}>{sub}</span>
    </div>
  );
}

function Badge({ text }) {
  return (
    <span className="nb-badge" style={styles.badge}>
      {text}
    </span>
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
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },

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
    fontSize: 16,
    fontWeight: 500,
    flexShrink: 0,
  },

  reportSelect: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#3F3F46",
    minHeight: 38,
    outline: "none",
    fontSize: 13,
    fontWeight: 400,
  },

  dateInput: {
    width: 132,
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#3F3F46",
    borderRadius: 9,
    minHeight: 38,
    padding: "7px 9px",
    outline: "none",
    fontSize: 12,
    fontWeight: 400,
  },

  paymentSelect: {
    width: 82,
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#3F3F46",
    borderRadius: 9,
    minHeight: 38,
    padding: "7px 9px",
    outline: "none",
    fontSize: 12,
    fontWeight: 400,
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 24,
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
    transition: "all 0.2s ease",
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