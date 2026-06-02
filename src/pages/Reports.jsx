import { useEffect, useMemo, useState } from "react";

const DASHBOARD_API_URL = "/api/reports/dashboard";
const CSV_EXPORT_API_URL = "/api/reports/export/csv";

function Reports({ role = "admin" }) {
  const [reportType, setReportType] = useState("Sales Report");
  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const userRole = String(role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN";

  const dateRange = useMemo(() => {
    return {
      startDate: toBackendDateTime(fromDate, "start"),
      endDate: toBackendDateTime(toDate, "end"),
    };
  }, [fromDate, toDate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardSummary();
    }
  }, [isAdmin, dateRange.startDate, dateRange.endDate]);

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

  async function fetchDashboardSummary() {
    const token = getToken();

    if (!token) {
      setDashboardData(null);
      setErrorMessage(
        "Login token not found. Please logout and login again as ADMIN."
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const url = `${DASHBOARD_API_URL}?startDate=${encodeURIComponent(
        dateRange.startDate
      )}&endDate=${encodeURIComponent(dateRange.endDate)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(response);
      setDashboardData(data || {});
    } catch (error) {
      setDashboardData(null);
      setErrorMessage(
        error.message ||
          "Unable to load report data. Check backend server and admin token."
      );
    } finally {
      setLoading(false);
    }
  }

  async function exportCSV() {
    const token = getToken();

    if (!token) {
      setErrorMessage(
        "Login token not found. Please logout and login again as ADMIN."
      );
      return;
    }

    try {
      setExporting(true);
      setErrorMessage("");

      const url = `${CSV_EXPORT_API_URL}?startDate=${encodeURIComponent(
        dateRange.startDate
      )}&endDate=${encodeURIComponent(dateRange.endDate)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `CSV export failed. Status: ${response.status}`
        );
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = downloadUrl;
      anchor.download = `sales_report_${Date.now()}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setErrorMessage(error.message || "Unable to export CSV report.");
    } finally {
      setExporting(false);
    }
  }

  function getPrintTableHtml() {
    if (reportType === "Sales Report") {
      const rows = topProducts
        .map(
          (product, index) => `
            <tr>
              <td>${
                escapeHtml(getTextValue(product, ["productName", "name"])) ||
                `Product ${index + 1}`
              }</td>
              <td>${getNumberValue(product, [
                "totalQuantitySold",
                "quantity",
                "qty",
              ])}</td>
              <td>${money(
                getNumberValue(product, [
                  "totalRevenueGenerated",
                  "revenue",
                  "amount",
                ])
              )}</td>
            </tr>
          `
        )
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
              `<tr><td colspan="3" class="empty">No sales report data found for selected date range.</td></tr>`
            }
          </tbody>
        </table>
      `;
    }

    if (reportType === "Payment Report") {
      const rows = paymentBreakdown
        .map(
          (payment) => `
            <tr>
              <td>${
                escapeHtml(getTextValue(payment, ["paymentMode", "mode"])) ||
                "Unknown"
              }</td>
              <td>${money(
                getNumberValue(payment, ["totalAmount", "amount"])
              )}</td>
              <td>${getNumberValue(payment, [
                "transactionCount",
                "count",
              ])}</td>
            </tr>
          `
        )
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
              `<tr><td colspan="3" class="empty">No payment report data found for selected date range.</td></tr>`
            }
          </tbody>
        </table>
      `;
    }

    const rows = cashierPerformances
      .map(
        (cashier, index) => `
          <tr>
            <td>${
              escapeHtml(
                getTextValue(cashier, [
                  "cashierName",
                  "name",
                  "username",
                  "email",
                ])
              ) || `Cashier ${index + 1}`
            }</td>
            <td>${getNumberValue(cashier, [
              "invoiceCount",
              "totalInvoices",
              "orders",
              "count",
            ])}</td>
            <td>${money(
              getNumberValue(cashier, ["revenue", "totalRevenue", "amount"])
            )}</td>
            <td>${money(
              getNumberValue(cashier, [
                "discount",
                "totalDiscount",
                "discountAmount",
              ])
            )}</td>
          </tr>
        `
      )
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
            `<tr><td colspan="4" class="empty">No cashier report data found for selected date range.</td></tr>`
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
              padding: 30px;
              background: #ffffff;
              color: #1f2937;
            }

            .report-page {
              max-width: 1000px;
              margin: 0 auto;
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
              width: 44px;
              height: 44px;
              border-radius: 10px;
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
              font-size: 24px;
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
              line-height: 1.7;
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
              padding: 13px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              border: 1px solid #efe7de;
            }

            td {
              border: 1px solid #efe7de;
              padding: 13px;
              font-size: 13px;
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
              size: A4;
              margin: 14mm;
            }

            @media print {
              body {
                padding: 0;
              }

              .report-page {
                max-width: 100%;
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
              <p>Report generated for selected date range from ${formatDisplayDate(
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
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
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

  const totalGrossRevenue = Number(dashboardData?.totalGrossRevenue || 0);
  const totalInvoicesGenerated = Number(
    dashboardData?.totalInvoicesGenerated || 0
  );
  const totalTaxCollected = Number(dashboardData?.totalTaxCollected || 0);
  const totalDiscountsGiven = Number(dashboardData?.totalDiscountsGiven || 0);

  const paymentBreakdown = Array.isArray(dashboardData?.paymentBreakdown)
    ? dashboardData.paymentBreakdown
    : [];

  const topProducts = Array.isArray(dashboardData?.topProducts)
    ? dashboardData.topProducts
    : [];

  const cashierPerformances = Array.isArray(dashboardData?.cashierPerformances)
    ? dashboardData.cashierPerformances
    : [];

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

        .nb-excel-export:hover {
          background: #C6A969 !important;
          color: #2D2D2D !important;
          border-color: #C6A969 !important;
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

        .nb-error-box {
          background: #FDF0F0;
          border: 1px solid #F0D0D0;
          color: #9B4444;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 500;
        }

        @media (max-width: 900px) {
          .reports-title-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }

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
        <div className="reports-title-row" style={styles.pageTitleRow}>
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
              onClick={exportCSV}
              className="nb-btn nb-excel-export"
              style={styles.excelBtn}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        {errorMessage && <div className="nb-error-box">{errorMessage}</div>}

        <div className="nb-report-card" style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <h2 style={styles.cardTitle}>{reportType}</h2>
              {loading && <p style={styles.muted}>Loading report data...</p>}
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
                <option>Payment Report</option>
                <option>Cashier Report</option>
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
          </div>

          <div className="reports-kpi-grid" style={styles.kpiGrid}>
            <Kpi
              title="Total Invoices"
              value={totalInvoicesGenerated}
              sub="Generated invoices"
            />

            <Kpi
              title="Sales Amount"
              value={money(totalGrossRevenue)}
              sub="Total sales value"
            />

            <Kpi
              title="GST Amount"
              value={money(totalTaxCollected)}
              sub="Tax collected"
            />

            <Kpi
              title="Discount"
              value={money(totalDiscountsGiven)}
              sub="Total discount"
            />
          </div>

          {reportType === "Sales Report" && (
            <ReportTable type="sales" topProducts={topProducts} loading={loading} />
          )}

          {reportType === "Payment Report" && (
            <ReportTable
              type="payment"
              paymentBreakdown={paymentBreakdown}
              loading={loading}
            />
          )}

          {reportType === "Cashier Report" && (
            <ReportTable
              type="cashier"
              cashierPerformances={cashierPerformances}
              loading={loading}
            />
          )}

          <p style={styles.reportFooter}>
            Generated from NexBill ERP • Smart E-Commerce Billing & Inventory
            Management System
          </p>
        </div>
      </section>
    </>
  );
}

function ReportTable({
  type,
  topProducts = [],
  paymentBreakdown = [],
  cashierPerformances = [],
  loading,
}) {
  if (type === "sales") {
    return (
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <Th>Product Name</Th>
              <Th>Quantity Sold</Th>
              <Th>Revenue Generated</Th>
            </tr>
          </thead>

          <tbody>
            {topProducts.map((product, index) => (
              <tr
                key={`${getTextValue(product, ["productName"])}-${index}`}
                className="nb-table-row"
              >
                <Td>
                  {getTextValue(product, ["productName", "name"]) ||
                    `Product ${index + 1}`}
                </Td>
                <Td>
                  {getNumberValue(product, [
                    "totalQuantitySold",
                    "quantity",
                    "qty",
                  ])}
                </Td>
                <Td>
                  {money(
                    getNumberValue(product, [
                      "totalRevenueGenerated",
                      "revenue",
                      "amount",
                    ])
                  )}
                </Td>
              </tr>
            ))}

            {topProducts.length === 0 && (
              <tr>
                <td colSpan="3" style={styles.emptyCell}>
                  {loading
                    ? "Loading top products..."
                    : "No sales report data found for selected date range."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "payment") {
    return (
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <Th>Payment Mode</Th>
              <Th>Total Amount</Th>
              <Th>Transaction Count</Th>
            </tr>
          </thead>

          <tbody>
            {paymentBreakdown.map((payment, index) => (
              <tr
                key={`${getTextValue(payment, ["paymentMode"])}-${index}`}
                className="nb-table-row"
              >
                <Td>
                  <Badge
                    text={
                      getTextValue(payment, ["paymentMode", "mode"]) ||
                      "Unknown"
                    }
                  />
                </Td>
                <Td>
                  {money(getNumberValue(payment, ["totalAmount", "amount"]))}
                </Td>
                <Td>
                  {getNumberValue(payment, ["transactionCount", "count"])}
                </Td>
              </tr>
            ))}

            {paymentBreakdown.length === 0 && (
              <tr>
                <td colSpan="3" style={styles.emptyCell}>
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

  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <Th>Cashier</Th>
            <Th>Invoices</Th>
            <Th>Revenue</Th>
            <Th>Discount</Th>
          </tr>
        </thead>

        <tbody>
          {cashierPerformances.map((cashier, index) => (
            <tr
              key={`${getTextValue(cashier, [
                "cashierName",
                "name",
                "email",
              ])}-${index}`}
              className="nb-table-row"
            >
              <Td>
                {getTextValue(cashier, [
                  "cashierName",
                  "name",
                  "username",
                  "email",
                ]) || `Cashier ${index + 1}`}
              </Td>
              <Td>
                {getNumberValue(cashier, [
                  "invoiceCount",
                  "totalInvoices",
                  "orders",
                  "count",
                ])}
              </Td>
              <Td>
                {money(
                  getNumberValue(cashier, [
                    "revenue",
                    "totalRevenue",
                    "amount",
                  ])
                )}
              </Td>
              <Td>
                {money(
                  getNumberValue(cashier, [
                    "discount",
                    "totalDiscount",
                    "discountAmount",
                  ])
                )}
              </Td>
            </tr>
          ))}

          {cashierPerformances.length === 0 && (
            <tr>
              <td colSpan="4" style={styles.emptyCell}>
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

function toBackendDateTime(dateValue, type) {
  const safeDate = dateValue || getTodayDate();
  const time = type === "start" ? "00:00:00" : "23:59:59";

  return `${safeDate}T${time}`;
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
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

  excelBtn: {
    minHeight: 42,
    borderRadius: 10,
    border: "1px solid #000000",
    background: "#000000",
    color: "#FFFFFF",
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
    minWidth: 720,
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

export default Reports;