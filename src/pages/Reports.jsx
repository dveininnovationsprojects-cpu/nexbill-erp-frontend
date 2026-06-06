import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CreditCard,
  Download,
  FileText,
  IndianRupee,
  Printer,
  Search,
  Tag,
  Users,
} from "lucide-react";
import api from "../api";

const REPORT_TYPES = ["Sales Report", "Payment Report", "Cashier Report"];

function Reports({ role = "admin" }) {
  const [reportType, setReportType] = useState("Sales Report");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = String(role || "admin").toUpperCase() === "ADMIN";

  const startDate = useMemo(() => {
    return `${fromDate || getTodayDate()}T00:00:00`;
  }, [fromDate]);

  const endDate = useMemo(() => {
    return `${toDate || getTodayDate()}T23:59:59`;
  }, [toDate]);

  useEffect(() => {
    if (isAdmin) {
      fetchReportSummary();
    }
  }, [isAdmin, startDate, endDate]);

  async function fetchReportSummary() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/reports/dashboard", {
        params: {
          startDate,
          endDate,
        },
      });

      setSummary(response.data || {});
    } catch (err) {
      setSummary(null);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load report data."
      );
    } finally {
      setLoading(false);
    }
  }

  async function exportCSV() {
    try {
      setExporting(true);
      setError("");

      const response = await api.get("/api/reports/export/csv", {
        params: {
          startDate,
          endDate,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `sales_report_${Date.now()}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to export CSV report."
      );
    } finally {
      setExporting(false);
    }
  }

  const totalGrossRevenue = Number(summary?.totalGrossRevenue || 0);
  const totalInvoicesGenerated = Number(summary?.totalInvoicesGenerated || 0);
  const totalTaxCollected = Number(summary?.totalTaxCollected || 0);
  const totalDiscountsGiven = Number(summary?.totalDiscountsGiven || 0);

  const paymentBreakdown = Array.isArray(summary?.paymentBreakdown)
    ? summary.paymentBreakdown
    : [];

  const topProducts = Array.isArray(summary?.topProducts)
    ? summary.topProducts
    : [];

  const cashierPerformances = Array.isArray(summary?.cashierPerformances)
    ? summary.cashierPerformances
    : [];

  const filteredRows = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (reportType === "Sales Report") {
      return topProducts.filter((item, index) => {
        const text = `${index + 1} ${getTextValue(item, [
          "productName",
          "name",
          "product",
        ])} ${getNumberValue(item, [
          "totalQuantitySold",
          "quantity",
        ])} ${getNumberValue(item, [
          "totalRevenueGenerated",
          "revenue",
          "amount",
        ])}`.toLowerCase();

        return text.includes(value);
      });
    }

    if (reportType === "Payment Report") {
      return paymentBreakdown.filter((item) => {
        const text = `${getTextValue(item, [
          "paymentMode",
          "mode",
        ])} ${getNumberValue(item, [
          "totalAmount",
          "amount",
        ])} ${getNumberValue(item, [
          "transactionCount",
          "count",
        ])}`.toLowerCase();

        return text.includes(value);
      });
    }

    return cashierPerformances.filter((item, index) => {
      const text = `${index + 1} ${getTextValue(item, [
        "cashierName",
        "name",
        "username",
        "email",
      ])} ${getNumberValue(item, [
        "invoiceCount",
        "totalInvoices",
        "orders",
        "count",
      ])} ${getNumberValue(item, [
        "revenue",
        "totalRevenue",
        "amount",
      ])}`.toLowerCase();

      return text.includes(value);
    });
  }, [reportType, searchTerm, topProducts, paymentBreakdown, cashierPerformances]);

  function getPrintTableHtml() {
    if (reportType === "Sales Report") {
      const rows = filteredRows
        .map((product, index) => {
          const productName =
            getTextValue(product, ["productName", "name", "product"]) ||
            `Product ${index + 1}`;

          const quantity = getNumberValue(product, [
            "totalQuantitySold",
            "quantity",
            "qty",
          ]);

          const revenue = getNumberValue(product, [
            "totalRevenueGenerated",
            "revenue",
            "amount",
            "totalAmount",
          ]);

          return `
            <tr>
              <td>${escapeHtml(productName)}</td>
              <td>${quantity}</td>
              <td>${money(revenue)}</td>
            </tr>
          `;
        })
        .join("");

      return `
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity Sold</th>
              <th>Revenue Generated</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows ||
              `<tr><td colspan="3" class="empty">No product report data found.</td></tr>`
            }
          </tbody>
        </table>
      `;
    }

    if (reportType === "Payment Report") {
      const rows = filteredRows
        .map((payment) => {
          const mode =
            getTextValue(payment, ["paymentMode", "mode"]) || "Unknown";

          const amount = getNumberValue(payment, ["totalAmount", "amount"]);
          const count = getNumberValue(payment, [
            "transactionCount",
            "count",
          ]);

          return `
            <tr>
              <td>${escapeHtml(mode)}</td>
              <td>${money(amount)}</td>
              <td>${count}</td>
            </tr>
          `;
        })
        .join("");

      return `
        <table>
          <thead>
            <tr>
              <th>Payment Mode</th>
              <th>Total Amount</th>
              <th>Transaction Count</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows ||
              `<tr><td colspan="3" class="empty">No payment report data found.</td></tr>`
            }
          </tbody>
        </table>
      `;
    }

    const rows = filteredRows
      .map((cashier, index) => {
        const cashierName =
          getTextValue(cashier, [
            "cashierName",
            "name",
            "username",
            "email",
          ]) || `Cashier ${index + 1}`;

        const invoiceCount = getNumberValue(cashier, [
          "invoiceCount",
          "totalInvoices",
          "orders",
          "count",
        ]);

        const revenue = getNumberValue(cashier, [
          "revenue",
          "totalRevenue",
          "amount",
          "salesAmount",
        ]);

        const discount = getNumberValue(cashier, [
          "discount",
          "totalDiscount",
          "discountAmount",
        ]);

        return `
          <tr>
            <td>${escapeHtml(cashierName)}</td>
            <td>${invoiceCount}</td>
            <td>${money(revenue)}</td>
            <td>${money(discount)}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <table>
        <thead>
          <tr>
            <th>Cashier</th>
            <th>Invoices</th>
            <th>Revenue</th>
            <th>Discount</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows ||
            `<tr><td colspan="4" class="empty">No cashier report data found.</td></tr>`
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
                  <p class="subtitle">Smart E-Commerce Billing & Inventory Management System</p>
                </div>
              </div>

              <div class="meta">
                <div><b>Report:</b> ${escapeHtml(reportType)}</div>
                <div><b>From:</b> ${formatDisplayDate(fromDate)}</div>
                <div><b>To:</b> ${formatDisplayDate(toDate)}</div>
                <div><b>Generated:</b> ${new Date().toLocaleString("en-IN")}</div>
              </div>
            </div>

            <div class="report-title">
              <h2>${escapeHtml(reportType)}</h2>
              <p>Report generated from ${formatDisplayDate(
                fromDate
              )} to ${formatDisplayDate(toDate)}.</p>
            </div>

            <div class="summary-grid">
              <div class="summary-card">
                <span>Total Invoices</span>
                <strong>${totalInvoicesGenerated}</strong>
              </div>

              <div class="summary-card">
                <span>Sales Amount</span>
                <strong>${money(totalGrossRevenue)}</strong>
              </div>

              <div class="summary-card">
                <span>GST Amount</span>
                <strong>${money(totalTaxCollected)}</strong>
              </div>

              <div class="summary-card">
                <span>Discount</span>
                <strong>${money(totalDiscountsGiven)}</strong>
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
      <section className="rep-page">
        <div className="rep-card rep-empty-main">
          Only admin can access Reports & Export.
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        .rep-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          font-family: Inter, system-ui, sans-serif;
        }

        .rep-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .rep-title {
          margin: 0;
          color: #111827;
          font-size: 22px;
          font-weight: 600;
        }

        .rep-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rep-btn {
          min-height: 40px;
          border-radius: 10px;
          padding: 0 16px;
          border: 1px solid #d6d3d1;
          background: #ffffff;
          color: #2d2d2d;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: all 0.2s ease;
        }

        .rep-btn:hover {
          background: #c6a969;
          border-color: #c6a969;
          color: #2d2d2d;
          transform: translateY(-1px);
        }

        .rep-btn-primary {
          border-color: #c6a969;
          background: #c6a969;
          color: #2d2d2d;
          font-weight: 600;
        }

        .rep-card {
          background: #ffffff;
          border: 1px solid #efe7de;
          border-radius: 14px;
          box-shadow: 0 1px 4px rgba(45, 45, 45, 0.05);
          padding: 20px;
        }

        .rep-card-title {
          margin: 0 0 16px;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .rep-toolbar {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .rep-search {
          flex: 1;
          min-width: 260px;
          min-height: 42px;
          border: 1px solid #d6d3d1;
          border-radius: 10px;
          background: #ffffff;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 13px;
        }

        .rep-search:focus-within,
        .rep-input:focus,
        .rep-select:focus {
          border-color: #c6a969;
          box-shadow: 0 0 0 3px rgba(198, 169, 105, 0.13);
        }

        .rep-search input {
          border: none;
          outline: none;
          background: transparent;
          flex: 1;
          font-size: 13px;
          color: #111827;
          min-height: 38px;
        }

        .rep-input,
        .rep-select {
          min-height: 42px;
          border: 1px solid #d6d3d1;
          border-radius: 10px;
          background: #ffffff;
          color: #111827;
          font-size: 13px;
          padding: 0 12px;
          outline: none;
        }

        .rep-select {
          min-width: 160px;
        }

        .rep-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .rep-kpi {
          border: 1px solid #efe7de;
          border-radius: 14px;
          background: #ffffff;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rep-kpi-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .rep-kpi-value {
          margin: 0;
          color: #111827;
          font-size: 21px;
          font-weight: 600;
          line-height: 1;
        }

        .rep-kpi-label {
          margin: 5px 0 0;
          color: #8b7355;
          font-size: 12px;
          font-weight: 500;
        }

        .rep-table-wrap {
          border: 1px solid #efe7de;
          border-radius: 14px;
          overflow-x: auto;
        }

        .rep-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
        }

        .rep-table th {
          background: #ede6de;
          color: #8b7355;
          text-align: left;
          padding: 13px 14px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .rep-table td {
          border-top: 1px solid #efe7de;
          padding: 13px 14px;
          font-size: 13px;
          font-weight: 400;
          color: #111827;
        }

        .rep-table tr:hover td {
          background: #fffdfb;
        }

        .rep-empty {
          text-align: center;
          color: #8b7355;
          padding: 38px !important;
        }

        .rep-empty-main {
          text-align: center;
          color: #8b7355;
          padding: 40px;
        }

        .rep-error {
          background: #fdf0f0;
          border: 1px solid #f0d0d0;
          color: #9b4444;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
        }

        .rep-footer {
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid #efe7de;
          text-align: center;
          color: #8b7355;
          font-size: 12px;
        }

        @media (max-width: 900px) {
          .rep-kpi-grid {
            grid-template-columns: 1fr;
          }

          .rep-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .rep-input,
          .rep-select {
            width: 100%;
          }
        }
      `}</style>

      <section className="rep-page">
        <div className="rep-top-row">
          <h1 className="rep-title">Reports & Export</h1>

          <div className="rep-actions">
            <button type="button" className="rep-btn" onClick={exportPDF}>
              <Printer size={15} />
              Export PDF
            </button>

            <button
              type="button"
              className="rep-btn rep-btn-primary"
              onClick={exportCSV}
              disabled={exporting}
            >
              <Download size={15} />
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        {error && <div className="rep-error">{error}</div>}

        <div className="rep-card">
          <h2 className="rep-card-title">{reportType}</h2>

          <div className="rep-toolbar">
            <div className="rep-search">
              <Search size={16} color="#8B7355" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search report data..."
              />
            </div>

            <select
              className="rep-select"
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
            >
              {REPORT_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <input
              className="rep-input"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />

            <input
              className="rep-input"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>

          {loading && <div className="rep-error">Loading report data...</div>}

          <div className="rep-kpi-grid">
            <Kpi
              icon={<FileText size={20} />}
              bg="#F4EBDD"
              color="#8B7355"
              label="Total Invoices"
              value={totalInvoicesGenerated}
            />

            <Kpi
              icon={<IndianRupee size={20} />}
              bg="#EAF4EA"
              color="#2F5D3A"
              label="Sales Amount"
              value={money(totalGrossRevenue)}
            />

            <Kpi
              icon={<Tag size={20} />}
              bg="#FFF5DF"
              color="#C6A969"
              label="GST Amount"
              value={money(totalTaxCollected)}
            />

            <Kpi
              icon={<CreditCard size={20} />}
              bg="#FBE7E7"
              color="#9B4444"
              label="Discount"
              value={money(totalDiscountsGiven)}
            />
          </div>

          {reportType === "Sales Report" && (
            <SalesTable rows={filteredRows} loading={loading} />
          )}

          {reportType === "Payment Report" && (
            <PaymentTable rows={filteredRows} loading={loading} />
          )}

          {reportType === "Cashier Report" && (
            <CashierTable rows={filteredRows} loading={loading} />
          )}

          <div className="rep-footer">
            Generated from NexBill ERP • Smart E-Commerce Billing & Inventory
            Management System
          </div>
        </div>
      </section>
    </>
  );
}

function SalesTable({ rows, loading }) {
  return (
    <div className="rep-table-wrap">
      <table className="rep-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Quantity Sold</th>
            <th>Revenue Generated</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((item, index) => {
            const productName =
              getTextValue(item, ["productName", "name", "product"]) ||
              `Product ${index + 1}`;

            const quantity = getNumberValue(item, [
              "totalQuantitySold",
              "quantity",
              "qty",
            ]);

            const revenue = getNumberValue(item, [
              "totalRevenueGenerated",
              "revenue",
              "amount",
              "totalAmount",
            ]);

            return (
              <tr key={`${productName}-${index}`}>
                <td>{productName}</td>
                <td>{quantity}</td>
                <td>{money(revenue)}</td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan="3" className="rep-empty">
                {loading
                  ? "Loading product report..."
                  : "No product report data found for selected date range."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PaymentTable({ rows, loading }) {
  return (
    <div className="rep-table-wrap">
      <table className="rep-table">
        <thead>
          <tr>
            <th>Payment Mode</th>
            <th>Total Amount</th>
            <th>Transaction Count</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((item, index) => {
            const mode =
              getTextValue(item, ["paymentMode", "mode"]) || "Unknown";

            const amount = getNumberValue(item, ["totalAmount", "amount"]);
            const count = getNumberValue(item, [
              "transactionCount",
              "count",
            ]);

            return (
              <tr key={`${mode}-${index}`}>
                <td>{mode}</td>
                <td>{money(amount)}</td>
                <td>{count}</td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan="3" className="rep-empty">
                {loading
                  ? "Loading payment report..."
                  : "No payment report data found for selected date range."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CashierTable({ rows, loading }) {
  return (
    <div className="rep-table-wrap">
      <table className="rep-table">
        <thead>
          <tr>
            <th>Cashier</th>
            <th>Invoices</th>
            <th>Revenue</th>
            <th>Discount</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((item, index) => {
            const cashierName =
              getTextValue(item, [
                "cashierName",
                "name",
                "username",
                "email",
              ]) || `Cashier ${index + 1}`;

            const invoices = getNumberValue(item, [
              "invoiceCount",
              "totalInvoices",
              "orders",
              "count",
            ]);

            const revenue = getNumberValue(item, [
              "revenue",
              "totalRevenue",
              "amount",
              "salesAmount",
            ]);

            const discount = getNumberValue(item, [
              "discount",
              "totalDiscount",
              "discountAmount",
            ]);

            return (
              <tr key={`${cashierName}-${index}`}>
                <td>{cashierName}</td>
                <td>{invoices}</td>
                <td>{money(revenue)}</td>
                <td>{money(discount)}</td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan="4" className="rep-empty">
                {loading
                  ? "Loading cashier report..."
                  : "No cashier report data found for selected date range."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Kpi({ icon, bg, color, label, value }) {
  return (
    <div className="rep-kpi">
      <div className="rep-kpi-icon" style={{ background: bg, color }}>
        {icon}
      </div>

      <div>
        <h3 className="rep-kpi-value">{value}</h3>
        <p className="rep-kpi-label">{label}</p>
      </div>
    </div>
  );
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getNumberValue(item, keys) {
  if (!item || typeof item !== "object") return 0;

  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) {
      const value = Number(item[key]);
      return Number.isNaN(value) ? 0 : value;
    }
  }

  return 0;
}

function getTextValue(item, keys) {
  if (!item || typeof item !== "object") return "";

  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) {
      return String(item[key]);
    }
  }

  return "";
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default Reports;