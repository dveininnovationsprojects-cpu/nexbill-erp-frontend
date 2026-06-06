import { useMemo, useState } from "react";
import {
  TrendingUp,
  IndianRupee,
  Tag,
  FileText,
  Calendar,
  CreditCard,
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
    : "Comprehensive Sales Report";

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
                No report data found for selected filters.
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
              <p>Report generated for selected parameters from ${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}.</p>
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
        <div className="rep-card" style={{ padding: "40px", textAlign: "center" }}>
          <h2 style={{ fontSize: "18px", color: "#2D2D2D", margin: "0 0 8px 0" }}>Access Denied</h2>
          <p style={{ color: "#8B7355", fontSize: "14px", margin: 0 }}>Only admin can access Reports & Export.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .rep-page { display: flex; flex-direction: column; gap: 20px; font-family: 'Inter', system-ui, sans-serif; }

        /* Header & Buttons */
        .rep-header-row { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-bottom: 4px; }
        .rep-page-title { margin: 0; color: #2D2D2D; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .rep-actions { display: flex; gap: 10px; }
        
        .rep-btn { padding: 9px 16px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 6px; transition: all 0.2s; white-space: nowrap; }
        .rep-btn-ghost { background: #FFFFFF; border: 1.5px solid #EFE7DE; color: #8B7355; }
        .rep-btn-ghost:hover { border-color: #C6A969; color: #2D2D2D; background: #FFFDFB; }
        .rep-btn-primary { background: #2D2D2D; border: 1.5px solid #2D2D2D; color: #F8F5F2; }
        .rep-btn-primary:hover { background: #C6A969; border-color: #C6A969; color: #2D2D2D; }

        /* Toolbar / Filters */
        .rep-toolbar { display: flex; align-items: flex-end; justify-content: flex-start; gap: 16px; flex-wrap: wrap; background: #FFFFFF; border: 1px solid #EFE7DE; border-radius: 12px; padding: 16px; box-shadow: 0 1px 4px rgba(45,45,45,0.03); }
        .rep-control-item { display: flex; flex-direction: column; gap: 6px; }
        .rep-control-label { font-size: 11px; font-weight: 600; color: #8B7355; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px; }
        
        /* Interactive Search + Report Type Bar */
        .rep-search-interactive-container { position: relative; flex: 1; min-width: 320px; }
        .rep-search-box { display: flex; align-items: center; gap: 10px; background: #FFFFFF; border: 1.5px solid #EFE7DE; border-radius: 9px; padding: 0 14px; height: 40px; transition: all 0.2s; cursor: text; }
        .rep-search-box:focus-within { border-color: #C6A969; box-shadow: 0 0 0 3px rgba(198,169,105,0.12); }
        .rep-search-box input { flex: 1; border: none; outline: none; background: transparent; font-size: 13px; font-family: inherit; color: #2D2D2D; font-weight: 500; }
        .rep-search-box input::placeholder { color: #A89F91; }
        .rep-active-report-badge { display: flex; align-items: center; gap: 4px; background: #F8F5F2; border: 1px solid #EFE7DE; color: #8B7355; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 6px; user-select: none; }
        
        /* Dropdown Menu for Search Bar */
        .rep-search-dropdown-menu { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #FFFFFF; border: 1px solid #EFE7DE; border-radius: 10px; box-shadow: 0 10px 25px rgba(45,45,45,0.08); z-index: 50; overflow: hidden; animation: repFadeIn 0.15s ease; }
        @keyframes repFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .rep-dropdown-header { padding: 10px 14px; font-size: 10px; font-weight: 700; color: #8B7355; text-transform: uppercase; letter-spacing: 0.5px; background: #FDFCFB; border-bottom: 1px solid #F8F5F2; }
        .rep-dropdown-item { padding: 12px 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: #2D2D2D; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #F8F5F2; }
        .rep-dropdown-item:last-child { border-bottom: none; }
        .rep-dropdown-item:hover { background: #F8F5F2; color: #C6A969; }
        .rep-dropdown-item.active { background: #FDF8EE; color: #C6A969; }

        /* Standard Dropdown (Payment) */
        .rep-dropdown { padding: 0 14px; border: 1.5px solid #EFE7DE; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; background: #FFFFFF; color: #2D2D2D; outline: none; transition: all 0.2s; min-width: 140px; height: 40px; }
        .rep-dropdown:focus { border-color: #C6A969; box-shadow: 0 0 0 3px rgba(198,169,105,0.12); }

        /* Unified Date Range Container (Matches Screenshot) */
        .rep-date-range-container { display: flex; align-items: center; background: #FFFFFF; border: 1.5px solid #EFE7DE; border-radius: 9px; height: 40px; overflow: hidden; transition: all 0.2s; padding: 0 8px; }
        .rep-date-range-container:focus-within { border-color: #C6A969; box-shadow: 0 0 0 3px rgba(198,169,105,0.12); }
        .rep-date-input-wrapper { display: flex; align-items: center; gap: 6px; }
        .rep-date-input-wrapper input[type="date"] { border: none; background: transparent; outline: none; font-size: 13px; font-weight: 600; color: #2D2D2D; cursor: pointer; font-family: inherit; width: 115px; }
        .rep-date-separator { font-size: 14px; color: #D6D3D1; padding: 0 6px; }

        /* KPI styling */
        .rep-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .rep-kpi { background: #FFFFFF; border: 1px solid #EFE7DE; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(45,45,45,0.04); transition: all 0.2s; }
        .rep-kpi:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(45,45,45,0.06); border-color: #C6A969; }
        .rep-kpi-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rep-kpi-icon.brown { background: #EFE7DE; color: #8B7355; }
        .rep-kpi-icon.green { background: #F0F7F0; color: #5A7A5A; }
        .rep-kpi-icon.amber { background: #FDF8EE; color: #C6A969; }
        .rep-kpi-icon.red { background: #FDF0F0; color: #9B4444; }
        .rep-kpi-val { font-size: 20px; font-weight: 700; color: #2D2D2D; line-height: 1; margin-bottom: 3px; }
        .rep-kpi-label { font-size: 12px; color: #8B7355; font-weight: 500; }
        .rep-kpi-sub { font-size: 11px; color: #C6A969; font-weight: 500; margin-top: 2px; }

        /* Card and Table styling */
        .rep-card { background: #FFFFFF; border: 1px solid #EFE7DE; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(45,45,45,0.05); }
        .rep-table-wrap { overflow-x: auto; }
        .rep-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 900px; }
        .rep-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; color: #8B7355; text-transform: uppercase; letter-spacing: 0.5px; background: #F8F5F2; border-bottom: 1px solid #EFE7DE; }
        .rep-table td { padding: 13px 16px; border-bottom: 1px solid #F8F5F2; color: #3F3F46; vertical-align: middle; font-size: 13px; font-weight: 500;}
        .rep-table tr:last-child td { border-bottom: none; }
        .rep-table tr:hover td { background: #FDFCFB; }
        .rep-table-empty { padding: 48px; text-align: center; color: #D6D3D1; font-size: 14px; }
        
        .rep-badge { display: inline-block; background: #F8F5F2; border: 1px solid #EFE7DE; color: #8B7355; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; text-align: center;}

        @media(max-width: 1024px) {
          .rep-search-interactive-container { min-width: 100%; }
        }

        @media(max-width: 900px) {
          .rep-header-row { flex-direction: column; align-items: flex-start; }
          .rep-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .rep-toolbar { flex-direction: column; align-items: stretch; }
          .rep-control-item { width: 100%; }
          .rep-dropdown { width: 100%; }
          .rep-date-range-container { justify-content: space-between; }
        }
      `}</style>

      <div className="rep-page">

        {/* Header & Actions */}
        <div className="rep-header-row">
          <h1 className="rep-page-title">Reports & Export</h1>
          <div className="rep-actions">
            <button className="rep-btn rep-btn-ghost" onClick={exportPDF}>
              <PrinterIcon size={16} /> Export PDF
            </button>
            <button className="rep-btn rep-btn-primary" onClick={exportExcel}>
              <Download size={16} /> Export Excel
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="rep-toolbar">
          
          {/* Interactive Search Bar (Includes Report Type selection on click) */}
          <div className="rep-control-item rep-search-interactive-container">
            <span className="rep-control-label"><Search size={12} /> Search & Report Filter</span>
            
            <div className="rep-search-box">
              <Search size={15} color="#8B7355" />
              <input 
                placeholder="Search invoice, customer, or product..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)} // Delay hides to allow click
              />
              <div 
                className="rep-active-report-badge" 
                onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                style={{ cursor: 'pointer' }}
              >
                {reportType} <ChevronDown size={12} />
              </div>
            </div>

            {/* The Dropdown containing the 3 features */}
            {showSearchDropdown && (
              <div className="rep-search-dropdown-menu">
                <div className="rep-dropdown-header">Filter by Report Type</div>
                
                {["Sales Report", "GST Report", "Customer Report"].map((type) => (
                  <div 
                    key={type}
                    className={`rep-dropdown-item ${reportType === type ? 'active' : ''}`}
                    onClick={() => {
                      setReportType(type);
                      setShowSearchDropdown(false);
                    }}
                  >
                    <FileText size={14} color={reportType === type ? "#C6A969" : "#8B7355"} />
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Native Date Range UI (Matches Screenshot) */}
          <div className="rep-control-item">
            <span className="rep-control-label"><Calendar size={12} /> Date Range</span>
            <div className="rep-date-range-container">
              <div className="rep-date-input-wrapper">
                <input 
                  type="date" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)} 
                />
              </div>
              <span className="rep-date-separator">→</span>
              <div className="rep-date-input-wrapper">
                <input 
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Payment Filter */}
          <div className="rep-control-item">
            <span className="rep-control-label"><CreditCard size={12} /> Payment</span>
            <select className="rep-dropdown" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option>All</option>
              <option>Paid</option>
              <option>Pending</option>
            </select>
          </div>

        </div>

        {/* KPI Cards */}
        <div className="rep-kpi-grid">
          <div className="rep-kpi">
            <div className="rep-kpi-icon brown"><FileText size={16} /></div>
            <div>
              <div className="rep-kpi-val">{filteredSales.length}</div>
              <div className="rep-kpi-label">Total Invoices</div>
              <div className="rep-kpi-sub">Filtered records</div>
            </div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon green"><TrendingUp size={16} /></div>
            <div>
              <div className="rep-kpi-val">{money(totalRevenue)}</div>
              <div className="rep-kpi-label">Sales Amount</div>
              <div className="rep-kpi-sub">Total sales value</div>
            </div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon amber"><IndianRupee size={16} /></div>
            <div>
              <div className="rep-kpi-val">{money(totalGst)}</div>
              <div className="rep-kpi-label">GST Amount</div>
              <div className="rep-kpi-sub">Tax report value</div>
            </div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon red"><Tag size={16} /></div>
            <div>
              <div className="rep-kpi-val">{money(totalDiscount)}</div>
              <div className="rep-kpi-label">Discount</div>
              <div className="rep-kpi-sub">Total discounts</div>
            </div>
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
                    <td style={{ color: "#2D2D2D", fontWeight: 600 }}>{sale.invoiceNo || sale.invoiceNumber || "-"}</td>
                    <td>{sale.customer || sale.customerName || "-"}</td>
                    <td>{sale.productName || sale.product || sale.itemName || "-"}</td>
                    <td>{sale.quantity || sale.qty || 0}</td>
                    <td style={{ color: "#2D2D2D", fontWeight: 600 }}>{money(sale.revenue || sale.totalAmount || sale.amount || 0)}</td>
                    <td>{money(sale.gst || sale.gstAmount || 0)}</td>
                    <td>{money(sale.discount || sale.discountAmount || 0)}</td>
                    <td>
                      <span className="rep-badge">
                        {sale.payment || sale.paymentStatus || "-"}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="9" className="rep-table-empty">
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