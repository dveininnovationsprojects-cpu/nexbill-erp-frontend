import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import {
  TrendingUp,
  IndianRupee,
  Ticket,
  Tag,
  BarChart2,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";

const API_BASE_URL = "/api/analytics/mega-dashboard";  // fallback to manual if 404

const PERIOD_OPTIONS = [
  { label: "Today", value: "Today" },
  { label: "This Week", value: "This Week" },
  { label: "This Month", value: "This Month" },
  { label: "This Year", value: "This Year" },
  { label: "Custom Range", value: "Range" },
];

function SalesAnalytics({ role = "admin" }) {
  const { user } = useAuth();

  const [periodFilter, setPeriodFilter] = useState("This Month");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isAdmin =
    role === "admin" ||
    role === "ADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "admin";

  const today = getTodayISO();

  const dateRange = useMemo(() => {
    return getDateRange(periodFilter, fromDate, toDate);
  }, [periodFilter, fromDate, toDate]);

  useEffect(() => {
    if (isAdmin) fetchDashboardData();
  }, [isAdmin, dateRange.startDate, dateRange.endDate]);

  function getAuthToken() {
    if (user?.token) return user.token;
    if (user?.accessToken) return user.accessToken;
    if (user?.jwt) return user.jwt;
    if (user?.user?.token) return user.user.token;
    if (user?.user?.accessToken) return user.user.accessToken;
    const keys = ["user","auth","token","authToken","accessToken","jwt","nexbill_user","nexbill_auth_user"];
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (!value) continue;
      try {
        const parsed = JSON.parse(value);
        if (parsed?.token) return parsed.token;
        if (parsed?.accessToken) return parsed.accessToken;
        if (parsed?.jwt) return parsed.jwt;
        if (parsed?.user?.token) return parsed.user.token;
        if (parsed?.data?.token) return parsed.data.token;
      } catch {
        if (value.startsWith("eyJ") || value.length > 40) return value;
      }
    }
    return "";
  }

  function getHeaders() {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function readResponse(response) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : await response.text();
    if (!response.ok) throw new Error(data?.message || data?.error || data || `Request failed: ${response.status}`);
    return data;
  }

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setErrorMessage("");
      const [billRes, custRes, prodRes, catRes] = await Promise.allSettled([
        api.get('/api/billing/history'),
        api.get('/api/customers'),
        api.get('/api/products/all'),
        api.get('/api/categories/all'),
      ]);
      const bills    = billRes.status === 'fulfilled' ? (billRes.value.data || []) : [];
      const custs    = custRes.status === 'fulfilled' ? (custRes.value.data || []) : [];
      const rawProds = prodRes.status === 'fulfilled' ? (prodRes.value.data || []) : [];
      const allCats  = catRes.status  === 'fulfilled' ? (catRes.value.data  || []) : [];

      // Fetch inventory stock for each product
      const invResults = await Promise.allSettled(
        rawProds.map(p => api.get(`/api/inventory/product/${p.id}`))
      );
      const prods = rawProds.map((p, i) => ({
        ...p,
        stock: invResults[i].status === 'fulfilled'
          ? Number(invResults[i].value.data?.availableQuantity ?? 0)
          : 0,
      }));

      console.log('bills:', bills.length, 'item[0]:', bills[0]?.items?.[0], 'prod[0]:', prods[0]);

      const grossRevenue        = bills.reduce((s, b) => s + Number(b.grandTotal || b.totalAmount || b.total || 0), 0);
      const totalDiscountsGiven = bills.reduce((s, b) => s + Number(b.discountTotal || b.discountAmount || b.discount || 0), 0);
      const averageTicketSize   = bills.length ? grossRevenue / bills.length : 0;
      const netProfitMargin     = grossRevenue - totalDiscountsGiven;

      // Category valuation from products inventory — use ALL categories
      const catMap = {};
      // Initialize all categories with 0
      allCats.forEach(c => {
        const name = c.name || c.categoryName || String(c.id);
        catMap[name] = { category: name, valuation: 0 };
      });
      // Add valuation from products
      prods.forEach(p => {
        const c = p.category?.name || p.category || 'Uncategorized';
        if (!catMap[c]) catMap[c] = { category: c, valuation: 0 };
        catMap[c].valuation += Number(p.sellingPrice || p.price || 0) * Number(p.stock || 0);
      });
      const categoryValuations = Object.values(catMap);

      // Product id & name -> category map
      const prodCatMap = {};
      prods.forEach(p => {
        const cat = p.category?.name || p.category || '—';
        prodCatMap[p.name?.toLowerCase()] = cat;
        prodCatMap[String(p.id)] = cat;
        if (p.sku) prodCatMap[p.sku?.toLowerCase()] = cat;
      });

      // Products from billing items
      const prodMap = {};
      bills.forEach(b => (b.items || []).forEach(it => {
        const n   = it.productName || it.name || 'Unknown';
        const cat = it.category?.name || it.category || it.categoryName
          || prodCatMap[n?.toLowerCase()]
          || prodCatMap[String(it.productId || it.id || '')]
          || '—';
        if (!prodMap[n]) prodMap[n] = { productName: n, category: cat, quantity: 0, revenue: 0, profit: 0 };
        const qty   = Number(it.quantity || it.qty || 0);
        const price = Number(it.unitPrice || it.sellingPrice || it.price || 0);
        const total = Number(it.totalPrice || it.lineTotal || it.amount || 0) || (price * qty);
        prodMap[n].quantity += qty;
        prodMap[n].revenue  += total;
      }));
      const highRevenueProducts = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
      const fastMovingProducts  = Object.values(prodMap).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

      // Top cashiers
      const cashierMap = {};
      bills.forEach(b => {
        const n = b.cashierName || b.cashierId || b.cashier || 'Unknown';
        if (!cashierMap[n]) cashierMap[n] = { cashierName: n, invoiceCount: 0, revenue: 0, discount: 0 };
        cashierMap[n].invoiceCount++;
        cashierMap[n].revenue  += Number(b.grandTotal || b.totalAmount || b.total || 0);
        cashierMap[n].discount += Number(b.discountTotal || b.discountAmount || b.discount || 0);
      });
      const topCashiers = Object.values(cashierMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      // Top spenders
      const topSpenders = [...custs]
        .sort((a, b) => Number(b.totalSpentAmount || b.totalSpent || 0) - Number(a.totalSpentAmount || a.totalSpent || 0))
        .slice(0, 5)
        .map(c => ({ customerName: c.name, totalSpent: c.totalSpentAmount || c.totalSpent || 0 }));

      const outOfStockCount      = prods.filter(p => Number(p.stock || p.stockQuantity || p.availableQuantity || 0) === 0).length;
      const newCustomersAcquired = custs.length;

      setDashboardData({
        grossRevenue, netProfitMargin, averageTicketSize, totalDiscountsGiven,
        outOfStockCount, deadStockCount: 0, newCustomersAcquired,
        categoryValuations, topCashiers, topSpenders,
        fastMovingProducts, highRevenueProducts,
      });
    } catch (error) {
      setErrorMessage(error.message || "Unable to load sales analytics.");
    } finally {
      setLoading(false);
    }
  }

  const grossRevenue = Number(dashboardData?.grossRevenue || 0);
  const netProfit = Number(dashboardData?.netProfitMargin || 0);
  const averageTicketSize = Number(dashboardData?.averageTicketSize || 0);
  const totalDiscountsGiven = Number(dashboardData?.totalDiscountsGiven || 0);
  const outOfStockCount = Number(dashboardData?.outOfStockCount || 0);
  const deadStockCount = Number(dashboardData?.deadStockCount || 0);
  const newCustomersAcquired = Number(dashboardData?.newCustomersAcquired || 0);

  const categoryValuations = Array.isArray(dashboardData?.categoryValuations) ? dashboardData.categoryValuations : [];
  const topCashiers = Array.isArray(dashboardData?.topCashiers) ? dashboardData.topCashiers : [];
  const topSpenders = Array.isArray(dashboardData?.topSpenders) ? dashboardData.topSpenders : [];
  const fastMovingProducts = Array.isArray(dashboardData?.fastMovingProducts) ? dashboardData.fastMovingProducts : [];
  const highRevenueProducts = Array.isArray(dashboardData?.highRevenueProducts) ? dashboardData.highRevenueProducts : [];

  const categoryOptions = useMemo(() => {
    const cats = new Set();
    categoryValuations.forEach((item, i) => {
      const n = getTextValue(item, ["category","categoryName","name","productCategory"]) || `Category ${i + 1}`;
      cats.add(n);
    });
    [...fastMovingProducts, ...highRevenueProducts].forEach((item) => {
      const n = getTextValue(item, ["category","categoryName","productCategory"]);
      if (n) cats.add(n);
    });
    return ["All", ...Array.from(cats)];
  }, [categoryValuations, fastMovingProducts, highRevenueProducts]);

  function isSelectedCategory(item, fallback = "") {
    if (categoryFilter === "All") return true;
    const n = getTextValue(item, ["category","categoryName","name","productCategory"]) || fallback;
    return n.toLowerCase() === categoryFilter.toLowerCase();
  }

  const filteredCategoryValuations = categoryValuations.filter((item, i) => isSelectedCategory(item, `Category ${i + 1}`));
  const filteredFastMovingProducts = fastMovingProducts.filter((item) => isSelectedCategory(item));
  const filteredHighRevenueProducts = highRevenueProducts.filter((item) => isSelectedCategory(item));

  const categoryChart = filteredCategoryValuations.map((item, i) => ({
    label: getTextValue(item, ["category","categoryName","name","productCategory"]) || `Category ${i + 1}`,
    value: getNumberValue(item, ["valuation","totalValue","stockValue","value","amount"]),
  }));

  const fastMovingChart = filteredFastMovingProducts.map((item, i) => ({
    label: getTextValue(item, ["productName","name","product","itemName","sku"]) || `Product ${i + 1}`,
    value: getNumberValue(item, ["quantity","totalQuantity","soldQuantity","units","count"]),
  }));

  const productsTable = filteredHighRevenueProducts.length > 0 ? filteredHighRevenueProducts : filteredFastMovingProducts;

  function getPeriodLabel() {
    if (periodFilter === "Range") {
      if (fromDate && toDate) return `${fromDate} → ${toDate}`;
      if (fromDate) return `From ${fromDate}`;
      if (toDate) return `Up to ${toDate}`;
      return "Custom Range";
    }
    return periodFilter;
  }

  if (!isAdmin) {
    return (
      <div className="sal-page">
        <div className="sal-card sal-card-pad" style={{ textAlign: "center" }}>
          <p style={{ color: "#8B7355", fontSize: 14 }}>Only admin can access Sales Dashboard & Analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .sal-page{display:flex;flex-direction:column;gap:20px;font-family:'Inter',system-ui,sans-serif}

        /* KPI styling */
        .sal-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .sal-kpi{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 3px rgba(45,45,45,0.04);transition:all 0.2s}
        .sal-kpi:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(45,45,45,0.06);border-color:#C6A969}
        .sal-kpi-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sal-kpi-icon.green{background:#F0F7F0;color:#5A7A5A}
        .sal-kpi-icon.brown{background:#EFE7DE;color:#8B7355}
        .sal-kpi-icon.amber{background:#FDF8EE;color:#C6A969}
        .sal-kpi-icon.red{background:#FDF0F0;color:#9B4444}
        .sal-kpi-val{font-size:20px;font-weight:700;color:#2D2D2D;line-height:1;margin-bottom:3px}
        .sal-kpi-label{font-size:12px;color:#8B7355;font-weight:500}
        .sal-kpi-sub{font-size:11px;color:#C6A969;font-weight:500;margin-top:2px}

        /* Toolbar styling - Right Aligned */
        .sal-toolbar{display:flex;align-items:flex-start;justify-content:flex-end;gap:16px;flex-wrap:wrap}
        
        .sal-control-item{display:flex;flex-direction:column;gap:6px}
        .sal-control-label{font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px}
        
        .sal-dropdown{padding:8px 14px;border:1.5px solid #EFE7DE;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;background:#FFFFFF;color:#2D2D2D;outline:none;transition:all 0.2s;min-width:160px}
        .sal-dropdown:focus{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}

        /* Inline Custom Date Picker */
        .sal-date-range-pill{display:flex;align-items:center;gap:8px;background:#FFFFFF;border:1.5px solid #EFE7DE;border-radius:9px;padding:6px 12px;transition:border-color 0.2s;height:35px;box-sizing:border-box}
        .sal-date-range-pill:focus-within{border-color:#C6A969;box-shadow:0 0 0 3px rgba(198,169,105,0.12)}
        .sal-date-input{border:none;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;background:transparent;color:#2D2D2D;outline:none;padding:0}
        .sal-date-separator{font-size:12px;font-weight:500;color:#D6D3D1}

        .sal-status-bar{display:flex;align-items:center;gap:10px;background:#FFFFFF;border:1px solid #EFE7DE;border-radius:10px;padding:10px 16px;font-size:12px;color:#8B7355}
        .sal-status-dot{width:7px;height:7px;border-radius:50%;background:#C6A969;flex-shrink:0}
        .sal-status-dot.loading{background:#5A7A5A;animation:salPulse 1s infinite}
        @keyframes salPulse{0%,100%{opacity:1}50%{opacity:0.4}}

        .sal-error{background:#FDF0F0;border:1px solid #F0D0D0;color:#9B4444;border-radius:10px;padding:12px 16px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:8px}

        .sal-chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .sal-bottom-grid{display:grid;grid-template-columns:1.4fr 0.6fr;gap:18px;align-items:start}

        /* Card and Table styling */
        .sal-card{background:#FFFFFF;border:1px solid #EFE7DE;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(45,45,45,0.05)}
        .sal-card-pad{padding:20px}
        .sal-card-title{font-size:14px;font-weight:700;color:#2D2D2D;margin:0 0 2px}
        .sal-card-sub{font-size:12px;color:#8B7355;margin:0}
        .sal-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}

        .sal-bar-chart{height:220px;display:flex;align-items:flex-end;gap:10px;padding-top:12px}
        .sal-bar-item{height:100%;flex:1;min-width:40px;display:grid;grid-template-rows:1fr auto auto;gap:6px;text-align:center}
        .sal-bar-track{background:#F8F5F2;border:1px solid #EFE7DE;border-radius:10px;overflow:hidden;display:flex;align-items:flex-end}
        .sal-bar-fill{width:100%;background:#8B7355;border-radius:8px 8px 0 0;transition:background 0.2s}
        .sal-bar-item:hover .sal-bar-fill{background:#C6A969}
        .sal-bar-val{font-size:10px;color:#2D2D2D;font-weight:600}
        .sal-bar-lbl{font-size:10px;color:#8B7355}
        .sal-chart-empty{width:100%;height:100%;display:grid;place-items:center;color:#8B7355;background:#F8F5F2;border:1px dashed #D6D3D1;border-radius:10px;font-size:13px}

        .sal-table-wrap{overflow-x:auto}
        .sal-table{width:100%;border-collapse:collapse;font-size:13px;min-width:600px}
        .sal-table th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:#8B7355;text-transform:uppercase;letter-spacing:0.5px;background:#F8F5F2;border-bottom:1px solid #EFE7DE}
        .sal-table td{padding:13px 16px;border-bottom:1px solid #F8F5F2;color:#3F3F46;vertical-align:middle;font-size:13px}
        .sal-table tr:last-child td{border-bottom:none}
        .sal-table tr:hover td{background:#FDFCFB}
        .sal-table-empty{padding:48px;text-align:center;color:#D6D3D1;font-size:14px}

        .sal-info-grid{display:grid;gap:10px}
        .sal-info-box{border:1px solid #EFE7DE;background:#FFFDFB;border-radius:10px;padding:13px 15px;transition:all 0.2s}
        .sal-info-box:hover{border-color:#C6A969;transform:translateY(-1px)}
        .sal-info-label{display:block;color:#8B7355;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px}
        .sal-info-value{display:block;color:#2D2D2D;font-size:14px;font-weight:700}

        .sal-insight-row{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;background:#F8F5F2;border:1px solid #EFE7DE;border-radius:10px;transition:all 0.2s}
        .sal-insight-row:hover{border-color:#C6A969;background:#FFFDFB}
        .sal-insight-label{font-size:12px;color:#8B7355;font-weight:500;display:flex;align-items:center;gap:7px}
        .sal-insight-val{font-size:14px;font-weight:700;color:#2D2D2D}
        .sal-insight-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}

        @media(max-width:900px){
          .sal-kpi-grid{grid-template-columns:repeat(2,1fr)}
          .sal-chart-grid,.sal-bottom-grid{grid-template-columns:1fr}
          .sal-toolbar{justify-content:flex-start}
          .sal-control-item{width:100%}
          .sal-dropdown{width:100%}
        }
      `}</style>

      <div className="sal-page">

        {/* Toolbar - Dropdowns right-aligned with top labels */}
        <div className="sal-toolbar">
          
          <div className="sal-control-item">
            <span className="sal-control-label">Time Period</span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <select
                className="sal-dropdown"
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                  if (e.target.value !== "Range") { setFromDate(""); setToDate(""); }
                }}
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {periodFilter === "Range" && (
                <div className="sal-date-range-pill">
                  <input 
                    className="sal-date-input" 
                    type="date" 
                    value={fromDate} 
                    max={today} 
                    onChange={(e) => setFromDate(e.target.value)} 
                    title="Start Date"
                  />
                  <span className="sal-date-separator">→</span>
                  <input 
                    className="sal-date-input" 
                    type="date" 
                    value={toDate} 
                    max={today} 
                    onChange={(e) => setToDate(e.target.value)} 
                    title="End Date"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="sal-control-item">
            <span className="sal-control-label">Category</span>
            <select className="sal-dropdown" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Status bar */}
        <div className="sal-status-bar">
          <span className={`sal-status-dot ${loading ? "loading" : ""}`} />
          <span>
            {loading
              ? "Loading analytics..."
              : <>Showing <strong>{getPeriodLabel()}</strong>{categoryFilter !== "All" && <> · <strong>{categoryFilter}</strong></>} analytics</>
            }
          </span>
        </div>

        {errorMessage && (
          <div className="sal-error">
            <AlertTriangle size={14} />
            {errorMessage}
          </div>
        )}

        {/* KPI Cards */}
        <div className="sal-kpi-grid">
          <div className="sal-kpi">
            <div className="sal-kpi-icon green"><TrendingUp size={16} /></div>
            <div>
              <div className="sal-kpi-val">{money(grossRevenue)}</div>
              <div className="sal-kpi-label">Gross Revenue</div>

            </div>
          </div>
          <div className="sal-kpi">
            <div className="sal-kpi-icon brown"><IndianRupee size={16} /></div>
            <div>
              <div className="sal-kpi-val">{money(netProfit)}</div>
              <div className="sal-kpi-label">Net Profit</div>

            </div>
          </div>
          <div className="sal-kpi">
            <div className="sal-kpi-icon amber"><Ticket size={16} /></div>
            <div>
              <div className="sal-kpi-val">{money(averageTicketSize)}</div>
              <div className="sal-kpi-label">Avg Ticket Size</div>

            </div>
          </div>
          <div className="sal-kpi">
            <div className="sal-kpi-icon red"><Tag size={16} /></div>
            <div>
              <div className="sal-kpi-val">{money(totalDiscountsGiven)}</div>
              <div className="sal-kpi-label">Total Discounts</div>

            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="sal-chart-grid">
          <SalChart title="Category Valuation" subtitle={`${getPeriodLabel()} inventory valuation`} data={categoryChart} moneyMode />
          <SalChart title="Fast Moving Products" subtitle={`${getPeriodLabel()} product movement`} data={fastMovingChart} />
        </div>

        {/* Top Products + Business Insights */}
        <div className="sal-bottom-grid">
          <div className="sal-card">
            <div className="sal-card-pad" style={{ borderBottom: "1px solid #EFE7DE", paddingBottom: 14 }}>
              <div className="sal-card-head" style={{ marginBottom: 0 }}>
                <div>
                  <div className="sal-card-title">Top Products</div>
                  <div className="sal-card-sub">Ranked by backend analytics</div>
                </div>
              </div>
            </div>
            <div className="sal-table-wrap">
              <table className="sal-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Units</th>
                    <th>Revenue</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {productsTable.length === 0 ? (
                    <tr><td colSpan={5} className="sal-table-empty">{loading ? "Loading..." : "No product analytics for selected period."}</td></tr>
                  ) : productsTable.map((p, i) => {
                    const name = getTextValue(p, ["productName","name","product","itemName","sku"]) || `Product ${i + 1}`;
                    const cat = getTextValue(p, ["category","categoryName","productCategory"]) || "—";
                    const units = getNumberValue(p, ["quantity","totalQuantity","soldQuantity","units","count"]);
                    const rev = getNumberValue(p, ["revenue","totalRevenue","amount","totalAmount","salesAmount"]);
                    const profit = getNumberValue(p, ["profit","netProfit","margin","profitAmount"]);
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: "#2D2D2D" }}>{name}</td>
                        <td>
                          <span style={{ background: "#EFE7DE", color: "#8B7355", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 600 }}>
                            {cat}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: "#2D2D2D" }}>{units}</td>
                        <td style={{ fontWeight: 600, color: "#2D2D2D" }}>{money(rev)}</td>
                        <td style={{ color: "#5A7A5A", fontWeight: 600 }}>{money(profit)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sal-card sal-card-pad">
            <div className="sal-card-head">
              <div>
                <div className="sal-card-title">Business Insights</div>
                <div className="sal-card-sub">Quick analytics summary</div>
              </div>
            </div>
            <div className="sal-info-grid">
              <InsightRow icon={<Package size={14} />} iconBg="#FDF0F0" iconColor="#9B4444" label="Out of Stock" value={outOfStockCount} />
              <InsightRow icon={<AlertTriangle size={14} />} iconBg="#FDF8EE" iconColor="#C6A969" label="Dead Stock" value={deadStockCount} />
              <InsightRow icon={<Users size={14} />} iconBg="#F0F7F0" iconColor="#5A7A5A" label="New Customers" value={newCustomersAcquired} />
              <InsightRow icon={<BarChart2 size={14} />} iconBg="#F4EBDD" iconColor="#8B7355" label="Top Cashiers" value={topCashiers.length} />
              <InsightRow icon={<TrendingUp size={14} />} iconBg="#EFE7DE" iconColor="#8B7355" label="Top Spenders" value={topSpenders.length} />
            </div>
          </div>
        </div>

        {/* Cashiers + Top Spenders */}
        <div className="sal-bottom-grid">
          <div className="sal-card">
            <div className="sal-card-pad" style={{ borderBottom: "1px solid #EFE7DE", paddingBottom: 14 }}>
              <div className="sal-card-head" style={{ marginBottom: 0 }}>
                <div>
                  <div className="sal-card-title">Top Cashiers</div>
                  <div className="sal-card-sub">Cashier performance analytics</div>
                </div>
              </div>
            </div>
            <div className="sal-table-wrap">
              <table className="sal-table">
                <thead>
                  <tr>
                    <th>Cashier</th>
                    <th>Invoices</th>
                    <th>Revenue</th>
                    <th>Discount</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {topCashiers.length === 0 ? (
                    <tr><td colSpan={5} className="sal-table-empty">{loading ? "Loading..." : "No cashier analytics for selected period."}</td></tr>
                  ) : topCashiers.map((c, i) => {
                    const name = getTextValue(c, ["cashierName","name","username","email"]) || `Cashier ${i + 1}`;
                    const invoices = getNumberValue(c, ["invoiceCount","totalInvoices","orders","count"]);
                    const rev = getNumberValue(c, ["revenue","totalRevenue","salesAmount","amount"]);
                    const disc = getNumberValue(c, ["discount","totalDiscount","discountAmount"]);
                    const perf = getTextValue(c, ["performance","rating","status"]) || "—";
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: "#2D2D2D" }}>{name}</td>
                        <td>{invoices}</td>
                        <td style={{ fontWeight: 600 }}>{money(rev)}</td>
                        <td style={{ color: "#9B4444" }}>{money(disc)}</td>
                        <td>
                          <span style={{ background: "#F0F7F0", color: "#2F5D3A", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 600 }}>
                            {perf}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sal-card sal-card-pad">
            <div className="sal-card-head">
              <div>
                <div className="sal-card-title">Top Spenders</div>
                <div className="sal-card-sub">Customer spend insights</div>
              </div>
            </div>
            <div className="sal-info-grid">
              {topSpenders.length === 0 ? (
                <div className="sal-info-box">
                  <span className="sal-info-label">Top Spenders</span>
                  <strong className="sal-info-value">{loading ? "Loading..." : "No data"}</strong>
                </div>
              ) : topSpenders.map((c, i) => {
                const name = getTextValue(c, ["customerName","name","mobile","email"]) || `Customer ${i + 1}`;
                const spent = getNumberValue(c, ["totalSpent","totalSpentAmount","amount","revenue","totalAmount"]);
                return (
                  <div key={i} className="sal-info-box">
                    <span className="sal-info-label">{name}</span>
                    <strong className="sal-info-value">{money(spent)}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InsightRow({ icon, iconBg, iconColor, label, value }) {
  return (
    <div className="sal-insight-row">
      <span className="sal-insight-label">
        <span className="sal-insight-icon" style={{ background: iconBg, color: iconColor }}>{icon}</span>
        {label}
      </span>
      <span className="sal-insight-val">{value}</span>
    </div>
  );
}

function SalChart({ title, subtitle, data, moneyMode }) {
  const max = Math.max(...data.map((d) => Number(d.value || 0)), 1);
  return (
    <div className="sal-card">
      <div className="sal-card-pad" style={{ borderBottom: data.length > 0 ? "1px solid #EFE7DE" : "none", paddingBottom: 14 }}>
        <div className="sal-card-title">{title}</div>
        <div className="sal-card-sub">{subtitle}</div>
      </div>
      <div className="sal-card-pad" style={{ paddingTop: 14 }}>
        <div className="sal-bar-chart">
          {data.length === 0 ? (
            <div className="sal-chart-empty">No chart data available</div>
          ) : data.map((item) => (
            <div key={item.label} className="sal-bar-item">
              <div className="sal-bar-track">
                <div
                  className="sal-bar-fill"
                  style={{ height: `${Math.max((Number(item.value || 0) / max) * 100, 8)}%` }}
                />
              </div>
              <b className="sal-bar-val">{moneyMode ? money(item.value) : item.value}</b>
              <span className="sal-bar-lbl">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */
function getDateRange(periodFilter, fromDate, toDate) {
  const now = new Date();
  if (periodFilter === "Today") return { startDate: toBackendDateTime(startOfDay(now)), endDate: toBackendDateTime(endOfDay(now)) };
  if (periodFilter === "This Week") return { startDate: toBackendDateTime(startOfWeek(now)), endDate: toBackendDateTime(endOfWeek(now)) };
  if (periodFilter === "This Month") return { startDate: toBackendDateTime(new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)), endDate: toBackendDateTime(new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)) };
  if (periodFilter === "This Year") return { startDate: toBackendDateTime(new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)), endDate: toBackendDateTime(new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)) };
  if (periodFilter === "Range") {
    const start = fromDate ? startOfDay(new Date(fromDate)) : startOfDay(now);
    const end = toDate ? endOfDay(new Date(toDate)) : endOfDay(now);
    return { startDate: toBackendDateTime(start), endDate: toBackendDateTime(end) };
  }
  return { startDate: toBackendDateTime(startOfDay(now)), endDate: toBackendDateTime(endOfDay(now)) };
}
function toBackendDateTime(date) {
  const p = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}
function getTodayISO() {
  const now = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())}`;
}
function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function endOfDay(d) { const r = startOfDay(d); r.setHours(23,59,59,999); return r; }
function startOfWeek(d) { const r = startOfDay(d); const day = r.getDay(); r.setDate(r.getDate() + (day === 0 ? -6 : 1 - day)); return r; }
function endOfWeek(d) { const r = startOfWeek(d); r.setDate(r.getDate()+6); r.setHours(23,59,59,999); return r; }
function getNumberValue(item, keys) {
  if (!item || typeof item !== "object") return 0;
  for (const key of keys) { if (item[key] != null) { const v = Number(item[key]); return isNaN(v) ? 0 : v; } }
  return 0;
}
function getTextValue(item, keys) {
  if (!item || typeof item !== "object") return "";
  for (const key of keys) { if (item[key] != null) return String(item[key]); }
  return "";
}
function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default SalesAnalytics;