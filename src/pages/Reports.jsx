import { useMemo, useState } from "react";
import {
  TrendingUp,
  IndianRupee,
  Tag,
  FileText,
  Download,
  Search,
  ChevronDown
} from "lucide-react";

function ReportsExport({ sales = [], role = "admin" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState("Sales Report");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const isAdmin = role === "admin" || role === "ADMIN";

  const reportTitle = searchTerm 
    ? `Search Report: "${searchTerm}"` 
    : reportType;

  const filteredSales = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    
    return sales.filter((sale) => {
      const matchDate = (!fromDate || sale.date >= fromDate) && (!toDate || sale.date <= toDate);
      const matchPayment = paymentFilter === "All" || String(sale.payment || sale.paymentStatus || "").toLowerCase() === paymentFilter.toLowerCase();
      
      const matchSearch = !searchTerm || 
        String(sale.invoiceNo || sale.invoiceNumber || "").toLowerCase().includes(lowerSearch) ||
        String(sale.customer || sale.customerName || "").toLowerCase().includes(lowerSearch) ||
        String(sale.productName || sale.product || sale.itemName || "").toLowerCase().includes(lowerSearch) ||
        String(sale.category || "").toLowerCase().includes(lowerSearch);

      return matchDate && matchPayment && matchSearch;
    });
  }, [sales, fromDate, toDate, paymentFilter, searchTerm]);

  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.revenue || sale.totalAmount || sale.amount || 0),
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
                No report data found. Connect billing module sales data here.
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
          <title>NexBill ERP - ${escapeHtml(reportTitle)}</title>
          <style>
            * { box-sizing: border-box; font-family: Arial, sans-serif; }
            body { margin: 0; padding: 0; background: #ffffff; color: #1f2937; }
            .report-page { width: 100%; max-width: 1050px; margin: 0 auto; padding: 28px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; border-bottom: 2px solid #c6a969; padding-bottom: 18px; margin-bottom: 22px; }
            .brand { display: flex; align-items: center; gap: 12px; }
            .logo { width: 46px; height: 46px; border-radius: 12px; background: #2d2d2d; color: #c6a969; display: grid; place-items: center; font-weight: 700; font-size: 20px; }
            h1 { margin: 0; color: #2d2d2d; font-size: 25px; font-weight: 700; }
            .subtitle { margin: 6px 0 0; color: #8b7355; font-size: 13px; }
            .meta { text-align: right; color: #8b7355; font-size: 12px; line-height: 1.8; min-width: 220px; }
            .report-title { background: #fffdfb; border: 1px solid #efe7de; border-radius: 14px; padding: 18px; margin-bottom: 20px; }
            .report-title h2 { margin: 0; font-size: 20px; color: #2d2d2d; }
            .report-title p { margin: 8px 0 0; color: #8b7355; font-size: 13px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
            .summary-card { border: 1px solid #efe7de; border-radius: 14px; padding: 16px; background: #fffdfb; }
            .summary-card span { display: block; color: #8b7355; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
            .summary-card strong { display: block; color: #2d2d2d; font-size: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
            th { background: #ede6de; color: #8b7355; text-align: left; padding: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border: 1px solid #efe7de; }
            td { border: 1px solid #efe7de; padding: 12px; font-size: 12px; color: #2d2d2d; }
            .empty { text-align: center; color: #8b7355; padding: 28px; }
            .footer { margin-top: 30px; text-align: center; color: #8b7355; font-size: 12px; border-top: 1px solid #efe7de; padding-top: 14px; }
            @page { size: A4 landscape; margin: 12mm; }
            @media print { body { padding: 0; } .report-page { max-width: 100%; padding: 0; } }
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
                <div><b>Payment:</b> ${escapeHtml(paymentFilter)}</div>
                <div><b>Generated:</b> ${new Date().toLocaleString("en-IN")}</div>
              </div>
            </div>
            <div class="report-title">
              <h2>${escapeHtml(reportTitle)}</h2>
              <p>Report generated for selected date range from ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}.</p>
            </div>
            <div class="summary-grid">
              <div class="summary-card"><span>Total Invoices</span><strong>${filteredSales.length}</strong></div>
              <div class="summary-card"><span>Sales Amount</span><strong>${money(totalRevenue)}</strong></div>
              <div class="summary-card"><span>GST Amount</span><strong>${money(totalGst)}</strong></div>
              <div class="summary-card"><span>Discount</span><strong>${money(totalDiscount)}</strong></div>
            </div>
            ${getPrintTableHtml()}
            <div class="footer">Generated from NexBill ERP • Smart E-Commerce Billing & Inventory Management System</div>
          </div>
          <script>
            window.onload = function () { setTimeout(function () { window.focus(); window.print(); }, 300); };
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
      <div className="rep-page">
        <div className="rep-card" style={{ padding: "48px", textAlign: "center" }}>
          <h2 style={{ fontSize: "18px", color: "#2D2D2D", margin: "0 0 8px 0" }}>Access Denied</h2>
          <p style={{ color: "#8B7355", fontSize: "14px", margin: 0 }}>Only admin can access Reports & Export.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Matched exactly to Inventory Module CSS */
        .rep-page { display: flex; flex-direction: column; gap: 20px; font-family: 'Inter', system-ui, sans-serif; }
        
        .rep-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .rep-title { margin: 0; color: #2D2D2D; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .rep-actions { display: flex; gap: 8px; }
        .rep-btn { padding: 9px 16px; border: 1.5px solid #EFE7DE; border-radius: 9px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; background: #FFFFFF; color: #8B7355; transition: all 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .rep-btn:hover { border-color: #C6A969; color: #2D2D2D; }
        .rep-btn.primary { background: #2D2D2D; color: #F8F5F2; border-color: #2D2D2D; }
        .rep-btn.primary:hover { background: #C6A969; color: #2D2D2D; border-color: #C6A969; }

        .rep-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .rep-kpi { background: #FFFFFF; border: 1px solid #EFE7DE; border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 4px rgba(45,45,45,0.05); }
        .rep-kpi-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rep-kpi-icon.blue { background: #EFE7DE; color: #8B7355; }
        .rep-kpi-icon.ok { background: #F0F7F0; color: #5A7A5A; }
        .rep-kpi-icon.warn { background: #FDF8EE; color: #C6A969; }
        .rep-kpi-icon.danger { background: #FDF0F0; color: #9B4444; }
        .rep-kpi-val { font-size: 22px; font-weight: 700; color: #2D2D2D; line-height: 1; margin-bottom: 3px; }
        .rep-kpi-label { font-size: 12px; color: #8B7355; font-weight: 500; }

        .rep-topbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        
        .rep-search-wrap { position: relative; flex: 1; min-width: 200px; display: flex; align-items: center; }
        .rep-search-wrap input { width: 100%; padding: 10px 14px 10px 38px; border: 1.5px solid #EFE7DE; border-radius: 10px; font-size: 13px; background: #FFFFFF; outline: none; font-family: inherit; color: #2D2D2D; box-sizing: border-box; font-weight: 500;}
        .rep-search-wrap input:focus { border-color: #C6A969; box-shadow: 0 0 0 3px rgba(198,169,105,0.12); }
        .rep-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #8B7355; pointer-events: none; }
        .rep-search-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #8B7355; cursor: pointer; }

        .rep-search-dropdown-menu { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #FFFFFF; border: 1px solid #EFE7DE; border-radius: 10px; box-shadow: 0 10px 25px rgba(45,45,45,0.08); z-index: 50; overflow: hidden; animation: repFadeIn 0.15s ease; }
        @keyframes repFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .rep-dropdown-item { padding: 12px 14px; font-size: 13px; font-weight: 500; color: #2D2D2D; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #F8F5F2; }
        .rep-dropdown-item:last-child { border-bottom: none; }
        .rep-dropdown-item:hover, .rep-dropdown-item.active { background: #F8F5F2; color: #C6A969; font-weight: 600; }

        .rep-filter-btns { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .rep-input { padding: 9px 12px; border: 1.5px solid #EFE7DE; border-radius: 9px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; background: #FFFFFF; color: #2D2D2D; outline: none; transition: all 0.2s; height: 38px; box-sizing: border-box; }
        .rep-input:focus { border-color: #C6A969; box-shadow: 0 0 0 3px rgba(198,169,105,0.12); }
        .rep-separator { color: #D6D3D1; font-weight: 500; font-size: 12px; }

        .rep-card { background: #FFFFFF; border: 1px solid #EFE7DE; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(45,45,45,0.05); }
        .rep-table-wrap { overflow-x: auto; }
        .rep-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 1000px; }
        .rep-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; color: #8B7355; text-transform: uppercase; letter-spacing: 0.5px; background: #F8F5F2; border-bottom: 1px solid #EFE7DE; }
        .rep-table td { padding: 13px 16px; border-bottom: 1px solid #F8F5F2; color: #3F3F46; vertical-align: middle; }
        .rep-table tr:last-child td { border-bottom: none; }
        .rep-table tr:hover td { background: #FDFCFB; }
        .rep-empty { padding: 48px; text-align: center; color: #D6D3D1; font-size: 14px; }
        
        .rep-badge { display: inline-block; background: #F8F5F2; border: 1px solid #EFE7DE; color: #8B7355; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; text-align: center; }

        @media(max-width: 900px) {
          .rep-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .rep-topbar { flex-direction: column; align-items: stretch; }
          .rep-search-wrap { width: 100%; }
        }
      `}</style>

      <div className="rep-page">

        {/* Header & Export Actions */}
        <div className="rep-header">
          <h1 className="rep-title">Reports & Export</h1>
          <div className="rep-actions">
            <button className="rep-btn" onClick={exportPDF}>
              <PrinterIcon size={14} /> Export PDF
            </button>
            <button className="rep-btn primary" onClick={exportExcel}>
              <Download size={14} /> Export Excel
            </button>
          </div>
        </div>

        {/* KPI Cards (Inventory Style) */}
        <div className="rep-kpi-grid">
          <div className="rep-kpi">
            <div className="rep-kpi-icon blue"><FileText size={18} /></div>
            <div>
              <div className="rep-kpi-val">{filteredSales.length}</div>
              <div className="rep-kpi-label">Total Invoices</div>
            </div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon ok"><TrendingUp size={18} /></div>
            <div>
              <div className="rep-kpi-val">{money(totalRevenue)}</div>
              <div className="rep-kpi-label">Sales Amount</div>
            </div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon warn"><IndianRupee size={18} /></div>
            <div>
              <div className="rep-kpi-val">{money(totalGst)}</div>
              <div className="rep-kpi-label">GST Amount</div>
            </div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon danger"><Tag size={18} /></div>
            <div>
              <div className="rep-kpi-val">{money(totalDiscount)}</div>
              <div className="rep-kpi-label">Discount</div>
            </div>
          </div>
        </div>

        {/* Topbar (Search + Filters exactly like Inventory) */}
        <div className="rep-topbar">
          
          {/* Search Wrap with Report Type Dropdown */}
          <div className="rep-search-wrap">
            <Search size={15} className="rep-search-icon" />
            <input 
              placeholder={`Search ${reportType} (invoice, customer, product)...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            />
            <ChevronDown 
              size={15} 
              className="rep-search-arrow" 
              onClick={() => setShowSearchDropdown(!showSearchDropdown)} 
            />

            {showSearchDropdown && (
              <div className="rep-search-dropdown-menu">
                {["Sales Report", "GST Report", "Customer Report"].map((type) => (
                  <div 
                    key={type}
                    className={`rep-dropdown-item ${reportType === type ? 'active' : ''}`}
                    onClick={() => {
                      setReportType(type);
                      setSearchTerm("");
                      setShowSearchDropdown(false);
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rep-filter-btns">
            <input 
              className="rep-input"
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
              title="From Date"
            />
            <span className="rep-separator">→</span>
            <input 
              className="rep-input"
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
              title="To Date"
            />
            <select 
              className="rep-input" 
              value={paymentFilter} 
              onChange={(e) => setPaymentFilter(e.target.value)}
              title="Payment Status Filter"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table Card */}
        <div className="rep-card">
          <div className="rep-table-wrap">
            <table className="rep-table">
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
                {filteredSales.map((sale, index) => (
                  <tr key={sale.id || sale.invoiceNo || index}>
                    <td>{sale.date || "-"}</td>
                    <td style={{ fontWeight: 500, color: "#2D2D2D" }}>{sale.invoiceNo || sale.invoiceNumber || "-"}</td>
                    <td>{sale.customer || sale.customerName || "-"}</td>
                    <td style={{ fontSize: 12, color: "#3F3F46" }}>{sale.productName || sale.product || sale.itemName || "-"}</td>
                    <td style={{ fontWeight: 500, color: "#2D2D2D" }}>{sale.quantity || sale.qty || 0}</td>
                    <td style={{ fontWeight: 600, color: "#2D2D2D" }}>{money(sale.revenue || sale.totalAmount || sale.amount || 0)}</td>
                    <td style={{ color: "#8B7355" }}>{money(sale.gst || sale.gstAmount || 0)}</td>
                    <td style={{ color: "#9B4444" }}>{money(sale.discount || sale.discountAmount || 0)}</td>
                    <td>
                      <span className="rep-badge">
                        {sale.payment || sale.paymentStatus || "-"}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="9" className="rep-empty">
                      No report data found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}

// Minimal icon helper for Printer
function PrinterIcon({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
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

export default ReportsExport;