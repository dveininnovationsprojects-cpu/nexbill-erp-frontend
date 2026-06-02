import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "/api/analytics/mega-dashboard";

function SalesAnalytics({ role = "admin" }) {
  const { user } = useAuth();

  const [periodFilter, setPeriodFilter] = useState("Today");
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
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, dateRange.startDate, dateRange.endDate]);

  function getAuthToken() {
    if (user?.token) return user.token;
    if (user?.accessToken) return user.accessToken;
    if (user?.jwt) return user.jwt;
    if (user?.user?.token) return user.user.token;
    if (user?.user?.accessToken) return user.user.accessToken;

    const possibleKeys = [
      "user",
      "auth",
      "token",
      "authToken",
      "accessToken",
      "jwt",
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
    const token = getAuthToken();

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

  async function fetchDashboardData() {
    if (!dateRange.startDate || !dateRange.endDate) return;

    const token = getAuthToken();

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

      const url = `${API_BASE_URL}?startDate=${encodeURIComponent(
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
          "Unable to load sales analytics. Check backend server and admin token."
      );
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

  const categoryValuations = Array.isArray(dashboardData?.categoryValuations)
    ? dashboardData.categoryValuations
    : [];

  const topCashiers = Array.isArray(dashboardData?.topCashiers)
    ? dashboardData.topCashiers
    : [];

  const topSpenders = Array.isArray(dashboardData?.topSpenders)
    ? dashboardData.topSpenders
    : [];

  const fastMovingProducts = Array.isArray(dashboardData?.fastMovingProducts)
    ? dashboardData.fastMovingProducts
    : [];

  const highRevenueProducts = Array.isArray(dashboardData?.highRevenueProducts)
    ? dashboardData.highRevenueProducts
    : [];

  const categoryOptions = useMemo(() => {
    const categories = new Set();

    categoryValuations.forEach((item, index) => {
      const categoryName =
        getTextValue(item, [
          "category",
          "categoryName",
          "name",
          "productCategory",
        ]) || `Category ${index + 1}`;

      categories.add(categoryName);
    });

    [...fastMovingProducts, ...highRevenueProducts].forEach((item) => {
      const categoryName = getTextValue(item, [
        "category",
        "categoryName",
        "productCategory",
      ]);

      if (categoryName) categories.add(categoryName);
    });

    return ["All", ...Array.from(categories)];
  }, [categoryValuations, fastMovingProducts, highRevenueProducts]);

  function isSelectedCategory(item, fallbackLabel = "") {
    if (categoryFilter === "All") return true;

    const categoryName =
      getTextValue(item, [
        "category",
        "categoryName",
        "name",
        "productCategory",
      ]) || fallbackLabel;

    return categoryName.toLowerCase() === categoryFilter.toLowerCase();
  }

  const filteredCategoryValuations = categoryValuations.filter((item, index) =>
    isSelectedCategory(item, `Category ${index + 1}`)
  );

  const filteredFastMovingProducts = fastMovingProducts.filter((item) =>
    isSelectedCategory(item)
  );

  const filteredHighRevenueProducts = highRevenueProducts.filter((item) =>
    isSelectedCategory(item)
  );

  const categoryChart = filteredCategoryValuations.map((item, index) => ({
    label:
      getTextValue(item, [
        "category",
        "categoryName",
        "name",
        "productCategory",
      ]) || `Category ${index + 1}`,
    value: getNumberValue(item, [
      "valuation",
      "totalValue",
      "stockValue",
      "value",
      "amount",
    ]),
  }));

  const fastMovingChart = filteredFastMovingProducts.map((item, index) => ({
    label:
      getTextValue(item, [
        "productName",
        "name",
        "product",
        "itemName",
        "sku",
      ]) || `Product ${index + 1}`,
    value: getNumberValue(item, [
      "quantity",
      "totalQuantity",
      "soldQuantity",
      "units",
      "count",
    ]),
  }));

  const productsTable =
    filteredHighRevenueProducts.length > 0
      ? filteredHighRevenueProducts
      : filteredFastMovingProducts;

  function getShowingText() {
    let periodText = periodFilter;

    if (periodFilter === "Range") {
      if (fromDate && toDate) periodText = `${fromDate} to ${toDate}`;
      else if (fromDate) periodText = `From ${fromDate}`;
      else if (toDate) periodText = `Up to ${toDate}`;
      else periodText = "Custom Range";
    }

    if (categoryFilter !== "All") {
      return `${periodText} • ${categoryFilter}`;
    }

    return periodText;
  }

  function clearRange() {
    setFromDate("");
    setToDate("");
  }

  if (!isAdmin) {
    return (
      <section style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Access Denied</h2>
          <p style={styles.muted}>
            Only admin can access Sales Dashboard & Analytics.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        .nb-input:focus {
          border-color: #C6A969 !important;
          box-shadow: 0 0 0 3px rgba(198,169,105,0.13);
          background: #FFFFFF !important;
        }

        .nb-kpi-card {
          transition: all 0.2s ease;
        }

        .nb-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(45,45,45,0.08) !important;
          border-color: #C6A969 !important;
        }

        .nb-card {
          transition: all 0.2s ease;
        }

        .nb-card:hover {
          box-shadow: 0 16px 34px rgba(45,45,45,0.08) !important;
        }

        .nb-table-row:hover td {
          background: #FFFDFB;
        }

        .nb-bar-fill {
          transition: all 0.2s ease;
        }

        .nb-bar-item:hover .nb-bar-fill {
          background: #C6A969 !important;
        }

        .nb-info-box {
          transition: all 0.2s ease;
        }

        .nb-info-box:hover {
          transform: translateY(-1px);
          border-color: #C6A969 !important;
          background: #FFFFFF !important;
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
          .sales-title-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .sales-filters {
            width: 100% !important;
          }

          .sales-kpi-grid,
          .sales-chart-grid,
          .sales-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <section style={styles.page}>
        <div className="sales-title-row" style={styles.pageTitleRow}>
          <div>
            <h1 style={styles.pageTitle}>Sales Dashboard & Analytics</h1>
          </div>

          <div className="sales-filters" style={styles.filters}>
            <label style={styles.filterField}>
              <span style={styles.filterLabel}>Time Period</span>
              <select
                className="nb-input"
                value={periodFilter}
                onChange={(event) => {
                  setPeriodFilter(event.target.value);

                  if (event.target.value !== "Range") {
                    clearRange();
                  }
                }}
                style={styles.select}
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
                <option>Range</option>
              </select>
            </label>

            <label style={styles.filterField}>
              <span style={styles.filterLabel}>Category Wise Sales</span>
              <select
                className="nb-input"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                style={styles.categorySelect}
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </label>

            {periodFilter === "Range" && (
              <>
                <label style={styles.filterField}>
                  <span style={styles.filterLabel}>From Date</span>
                  <input
                    className="nb-input"
                    type="date"
                    value={fromDate}
                    min="2000-01-01"
                    max={today}
                    onChange={(event) => setFromDate(event.target.value)}
                    style={styles.dateInput}
                  />
                </label>

                <label style={styles.filterField}>
                  <span style={styles.filterLabel}>To Date</span>
                  <input
                    className="nb-input"
                    type="date"
                    value={toDate}
                    min="2000-01-01"
                    max={today}
                    onChange={(event) => setToDate(event.target.value)}
                    style={styles.dateInput}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <div style={styles.filterSummary}>
          Showing: <strong>{getShowingText()}</strong> analytics
          {loading && (
            <>
              {" "}
              • <strong>Loading...</strong>
            </>
          )}
        </div>

        {errorMessage && <div className="nb-error-box">{errorMessage}</div>}

        <div className="sales-kpi-grid" style={styles.kpiGrid}>
          <Kpi
            title="Gross Revenue"
            value={money(grossRevenue)}
            sub="Total revenue"
          />

          <Kpi
            title="Net Profit"
            value={money(netProfit)}
            sub="Backend net profit value"
          />

          <Kpi
            title="Average Ticket Size"
            value={money(averageTicketSize)}
            sub="Average invoice value"
          />

          <Kpi
            title="Total Discounts"
            value={money(totalDiscountsGiven)}
            sub="Discounts given"
          />
        </div>

        <div className="sales-chart-grid" style={styles.chartGrid}>
          <Chart
            title="Category Valuation"
            subtitle={`${getShowingText()} inventory category valuation`}
            data={categoryChart}
            moneyMode
          />

          <Chart
            title="Fast Moving Products"
            subtitle={`${getShowingText()} product movement quantity`}
            data={fastMovingChart}
          />
        </div>

        <div className="sales-bottom-grid" style={styles.bottomGrid}>
          <div className="nb-card" style={styles.card}>
            <div style={styles.cardHead}>
              <div>
                <h2 style={styles.cardTitle}>Top Products</h2>
                <p style={styles.muted}>
                  Products ranked by backend analytics.
                </p>
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>Category</Th>
                    <Th>Units</Th>
                    <Th>Revenue</Th>
                    <Th>Profit</Th>
                  </tr>
                </thead>

                <tbody>
                  {productsTable.map((product, index) => {
                    const productName =
                      getTextValue(product, [
                        "productName",
                        "name",
                        "product",
                        "itemName",
                        "sku",
                      ]) || `Product ${index + 1}`;

                    const category =
                      getTextValue(product, [
                        "category",
                        "categoryName",
                        "productCategory",
                      ]) || "-";

                    const units = getNumberValue(product, [
                      "quantity",
                      "totalQuantity",
                      "soldQuantity",
                      "units",
                      "count",
                    ]);

                    const revenue = getNumberValue(product, [
                      "revenue",
                      "totalRevenue",
                      "amount",
                      "totalAmount",
                      "salesAmount",
                    ]);

                    const profit = getNumberValue(product, [
                      "profit",
                      "netProfit",
                      "margin",
                      "profitAmount",
                    ]);

                    return (
                      <tr
                        key={`${productName}-${index}`}
                        className="nb-table-row"
                      >
                        <Td>{productName}</Td>
                        <Td>{category}</Td>
                        <Td>{units}</Td>
                        <Td>{money(revenue)}</Td>
                        <Td>{money(profit)}</Td>
                      </tr>
                    );
                  })}

                  {productsTable.length === 0 && (
                    <tr>
                      <td colSpan="5" style={styles.emptyCell}>
                        {loading
                          ? "Loading product analytics..."
                          : "No product analytics found for selected period/category."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="nb-card" style={styles.insightsCard}>
            <div style={styles.cardHead}>
              <div>
                <h2 style={styles.cardTitle}>Business Insights</h2>
                <p style={styles.muted}>Useful BA analytics summary.</p>
              </div>
            </div>

            <div style={styles.infoGridOne}>
              <Info label="Out of Stock Items" value={outOfStockCount} />
              <Info label="Dead Stock Items" value={deadStockCount} />
              <Info label="New Customers" value={newCustomersAcquired} />
              <Info label="Top Cashiers" value={topCashiers.length} />
              <Info label="Top Spenders" value={topSpenders.length} />
            </div>
          </div>
        </div>

        <div className="sales-bottom-grid" style={styles.bottomGrid}>
          <div className="nb-card" style={styles.card}>
            <div style={styles.cardHead}>
              <div>
                <h2 style={styles.cardTitle}>Top Cashiers</h2>
                <p style={styles.muted}>
                  Cashier performance from backend analytics.
                </p>
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <Th>Cashier</Th>
                    <Th>Invoices</Th>
                    <Th>Revenue</Th>
                    <Th>Discount</Th>
                    <Th>Performance</Th>
                  </tr>
                </thead>

                <tbody>
                  {topCashiers.map((cashier, index) => {
                    const cashierName =
                      getTextValue(cashier, [
                        "cashierName",
                        "name",
                        "username",
                        "email",
                      ]) || `Cashier ${index + 1}`;

                    const invoices = getNumberValue(cashier, [
                      "invoiceCount",
                      "totalInvoices",
                      "orders",
                      "count",
                    ]);

                    const revenue = getNumberValue(cashier, [
                      "revenue",
                      "totalRevenue",
                      "salesAmount",
                      "amount",
                    ]);

                    const discount = getNumberValue(cashier, [
                      "discount",
                      "totalDiscount",
                      "discountAmount",
                    ]);

                    const performance =
                      getTextValue(cashier, [
                        "performance",
                        "rating",
                        "status",
                      ]) || "-";

                    return (
                      <tr
                        key={`${cashierName}-${index}`}
                        className="nb-table-row"
                      >
                        <Td>{cashierName}</Td>
                        <Td>{invoices}</Td>
                        <Td>{money(revenue)}</Td>
                        <Td>{money(discount)}</Td>
                        <Td>{performance}</Td>
                      </tr>
                    );
                  })}

                  {topCashiers.length === 0 && (
                    <tr>
                      <td colSpan="5" style={styles.emptyCell}>
                        {loading
                          ? "Loading cashier analytics..."
                          : "No cashier analytics found for selected period."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="nb-card" style={styles.insightsCard}>
            <div style={styles.cardHead}>
              <div>
                <h2 style={styles.cardTitle}>Top Spenders</h2>
                <p style={styles.muted}>Customer insights summary.</p>
              </div>
            </div>

            <div style={styles.infoGridOne}>
              {topSpenders.map((customer, index) => {
                const customerName =
                  getTextValue(customer, [
                    "customerName",
                    "name",
                    "mobile",
                    "email",
                  ]) || `Customer ${index + 1}`;

                const spentAmount = getNumberValue(customer, [
                  "totalSpent",
                  "totalSpentAmount",
                  "amount",
                  "revenue",
                  "totalAmount",
                ]);

                return (
                  <Info
                    key={`${customerName}-${index}`}
                    label={customerName}
                    value={money(spentAmount)}
                  />
                );
              })}

              {topSpenders.length === 0 && (
                <Info
                  label="Top Spenders"
                  value={loading ? "Loading..." : "No data"}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function getDateRange(periodFilter, fromDate, toDate) {
  const now = new Date();

  if (periodFilter === "Today") {
    return {
      startDate: toBackendDateTime(startOfDay(now)),
      endDate: toBackendDateTime(endOfDay(now)),
    };
  }

  if (periodFilter === "This Week") {
    return {
      startDate: toBackendDateTime(startOfWeek(now)),
      endDate: toBackendDateTime(endOfWeek(now)),
    };
  }

  if (periodFilter === "This Month") {
    return {
      startDate: toBackendDateTime(
        new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      ),
      endDate: toBackendDateTime(
        new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      ),
    };
  }

  if (periodFilter === "This Year") {
    return {
      startDate: toBackendDateTime(
        new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      ),
      endDate: toBackendDateTime(
        new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      ),
    };
  }

  if (periodFilter === "Range") {
    const start = fromDate ? startOfDay(new Date(fromDate)) : startOfDay(now);
    const end = toDate ? endOfDay(new Date(toDate)) : endOfDay(now);

    return {
      startDate: toBackendDateTime(start),
      endDate: toBackendDateTime(end),
    };
  }

  return {
    startDate: toBackendDateTime(startOfDay(now)),
    endDate: toBackendDateTime(endOfDay(now)),
  };
}

function toBackendDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function getTodayISO() {
  return formatDateISO(new Date());
}

function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  const result = startOfDay(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function startOfWeek(date) {
  const result = startOfDay(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  return result;
}

function endOfWeek(date) {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);

  return result;
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

function Kpi({ title, value, sub }) {
  return (
    <div className="nb-kpi-card" style={styles.kpiCard}>
      <p style={styles.kpiTitle}>{title}</p>
      <h3 style={styles.kpiValue}>{value}</h3>
      <span style={styles.kpiSub}>{sub}</span>
    </div>
  );
}

function Chart({ title, subtitle, data, moneyMode }) {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);

  return (
    <div className="nb-card" style={styles.card}>
      <div style={styles.cardHead}>
        <div>
          <h2 style={styles.cardTitle}>{title}</h2>
          <p style={styles.muted}>{subtitle}</p>
        </div>
      </div>

      <div style={styles.barChart}>
        {data.length === 0 && (
          <div style={styles.chartEmpty}>No chart data available</div>
        )}

        {data.map((item) => (
          <div key={item.label} className="nb-bar-item" style={styles.barItem}>
            <div style={styles.barTrack}>
              <div
                className="nb-bar-fill"
                style={{
                  ...styles.barFill,
                  height: `${Math.max(
                    (Number(item.value || 0) / max) * 100,
                    8
                  )}%`,
                }}
              />
            </div>

            <b style={styles.barValue}>
              {moneyMode ? money(item.value) : item.value}
            </b>

            <span style={styles.barLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="nb-info-box" style={styles.infoBox}>
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
    gap: 12,
  },

  pageTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    marginBottom: -2,
  },

  pageTitle: {
    margin: 0,
    color: "#1F2937",
    fontSize: 22,
    letterSpacing: "-0.02em",
    fontWeight: 700,
  },

  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "flex-end",
  },

  filterField: {
    display: "grid",
    gap: 5,
  },

  filterLabel: {
    color: "#8B7355",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },

  filterSummary: {
    color: "#8B7355",
    fontSize: 13,
    background: "#FFFDFB",
    border: "1px solid #EFE7DE",
    borderRadius: 12,
    padding: "12px 14px",
    marginTop: -4,
    textAlign: "center",
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
    minWidth: 150,
  },

  categorySelect: {
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#3F3F46",
    borderRadius: 10,
    minHeight: 42,
    padding: "10px 14px",
    outline: "none",
    fontSize: 13,
    fontWeight: 400,
    minWidth: 180,
  },

  dateInput: {
    border: "1px solid #D6D3D1",
    background: "#FFFFFF",
    color: "#3F3F46",
    borderRadius: 10,
    minHeight: 42,
    padding: "10px 14px",
    outline: "none",
    fontSize: 13,
    fontWeight: 400,
    minWidth: 145,
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

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.65fr",
    gap: 18,
    alignItems: "stretch",
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid #EFE7DE",
    borderRadius: 16,
    boxShadow: "0 12px 28px rgba(45,45,45,0.05)",
    padding: 24,
  },

  insightsCard: {
    background: "#FFFFFF",
    border: "1px solid #EFE7DE",
    borderRadius: 16,
    boxShadow: "0 12px 28px rgba(45,45,45,0.05)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    height: "100%",
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

  barChart: {
    height: 250,
    display: "flex",
    alignItems: "flex-end",
    gap: 12,
    paddingTop: 18,
  },

  chartEmpty: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    color: "#8B7355",
    background: "#F8F5F2",
    border: "1px dashed #D6D3D1",
    borderRadius: 14,
    fontSize: 13,
    fontWeight: 500,
  },

  barItem: {
    height: "100%",
    flex: 1,
    minWidth: 50,
    display: "grid",
    gridTemplateRows: "1fr auto auto",
    gap: 8,
    textAlign: "center",
  },

  barTrack: {
    background: "#F8F5F2",
    border: "1px solid #EFE7DE",
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
  },

  barFill: {
    width: "100%",
    background: "#8B7355",
    borderRadius: "12px 12px 0 0",
  },

  barValue: {
    fontSize: 11,
    color: "#2D2D2D",
    fontWeight: 600,
  },

  barLabel: {
    fontSize: 11,
    color: "#8B7355",
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

  infoGridOne: {
    display: "grid",
    gap: 14,
    flex: 1,
    alignContent: "space-between",
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
    fontSize: 13,
    fontWeight: 500,
  },
};

export default SalesAnalytics;