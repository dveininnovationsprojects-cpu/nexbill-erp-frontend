import { useMemo, useState } from "react";

function SalesAnalytics({ role = "admin", sales = [] }) {
  const [periodFilter, setPeriodFilter] = useState("Today");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const today = getTodayISO();

  const categories = [
    "All Categories",
    ...new Set(sales.map((sale) => sale.category).filter(Boolean)),
  ];

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchCategory =
        categoryFilter === "All Categories" || sale.category === categoryFilter;

      const matchPeriod = dateMatches(sale.date, periodFilter, fromDate, toDate);

      return matchCategory && matchPeriod;
    });
  }, [sales, categoryFilter, periodFilter, fromDate, toDate]);

  if (role !== "admin") {
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

  const totalRevenue = filteredSales.reduce(
    (sum, sale) =>
      sum + Number(sale.revenue || sale.totalAmount || sale.amount || 0),
    0
  );

  const totalCost = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.cost || 0),
    0
  );

  const totalQuantity = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.quantity || sale.qty || 0),
    0
  );

  const totalGst = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.gst || sale.gstAmount || 0),
    0
  );

  const grossProfit = totalRevenue - totalCost;

  const profitMargin =
    totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  const averageOrderValue =
    filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  const pendingPayments = filteredSales.filter(
    (sale) =>
      String(sale.payment || sale.paymentStatus || "").toLowerCase() ===
      "pending"
  ).length;

  const revenueChart = groupByDate(filteredSales, "revenue");
  const salesGraph = groupByDate(filteredSales, "quantity");
  const topProducts = groupByProduct(filteredSales).slice(0, 5);

  function getShowingText() {
    if (periodFilter === "Range") {
      if (fromDate && toDate) return `${fromDate} to ${toDate}`;
      if (fromDate) return `From ${fromDate}`;
      if (toDate) return `Up to ${toDate}`;
      return "Custom Range";
    }

    return periodFilter;
  }

  function clearRange() {
    setFromDate("");
    setToDate("");
  }

  return (
    <section style={styles.page}>
      <div style={styles.pageTitleRow}>
        <div>
          <h1 style={styles.pageTitle}>Sales Dashboard & Analytics</h1>
        </div>

        <div style={styles.filters}>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Time Period</span>
            <select
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

          {periodFilter === "Range" && (
            <>
              <label style={styles.filterField}>
                <span style={styles.filterLabel}>From Date</span>
                <input
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

          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              style={styles.select}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div style={styles.filterSummary}>
        Showing: <strong>{getShowingText()}</strong> sales
        {categoryFilter !== "All Categories" && (
          <>
            {" "}
            for <strong>{categoryFilter}</strong>
          </>
        )}
      </div>

      <div style={styles.kpiGrid}>
        <Kpi
          title="Total Revenue"
          value={money(totalRevenue)}
          sub="Filtered revenue"
        />

        <Kpi
          title="Total Orders"
          value={filteredSales.length}
          sub="Completed invoices"
        />

        <Kpi
          title="Products Sold"
          value={totalQuantity}
          sub="Total quantity"
        />

        <Kpi
          title="Profit Margin"
          value={`${profitMargin}%`}
          sub={money(grossProfit)}
        />
      </div>

      <div style={styles.chartGrid}>
        <Chart
          title="Revenue Chart"
          subtitle={`${getShowingText()} revenue performance`}
          data={revenueChart}
          moneyMode
        />

        <Chart
          title="Sales Graph"
          subtitle={`${getShowingText()} product sales quantity`}
          data={salesGraph}
        />
      </div>

      <div style={styles.bottomGrid}>
        <div style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <h2 style={styles.cardTitle}>Top Products</h2>
              <p style={styles.muted}>
                Best selling products ranked by revenue.
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
                {topProducts.map((product) => (
                  <tr key={product.productName}>
                    <Td>{product.productName}</Td>
                    <Td>{product.category}</Td>
                    <Td>{product.quantity}</Td>
                    <Td>{money(product.revenue)}</Td>
                    <Td>{money(product.revenue - product.cost)}</Td>
                  </tr>
                ))}

                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan="5" style={styles.emptyCell}>
                      No sales data found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <h2 style={styles.cardTitle}>Business Insights</h2>
              <p style={styles.muted}>Useful BA analytics summary.</p>
            </div>
          </div>

          <div style={styles.infoGridOne}>
            <Info label="Total Cost" value={money(totalCost)} />
            <Info label="Gross Profit" value={money(grossProfit)} />
            <Info label="Average Order Value" value={money(averageOrderValue)} />
            <Info label="GST Collected" value={money(totalGst)} />
            <Info label="Pending Payments" value={pendingPayments} />
          </div>
        </div>
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

function dateMatches(date, filter, fromDate, toDate) {
  if (!date) return false;

  const selectedDate = new Date(date);
  const now = new Date();

  if (Number.isNaN(selectedDate.getTime())) return false;

  if (filter === "Today") {
    return isSameDay(selectedDate, now);
  }

  if (filter === "This Week") {
    const start = startOfWeek(now);
    const end = endOfWeek(now);

    return selectedDate >= start && selectedDate <= end;
  }

  if (filter === "This Month") {
    return (
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
    );
  }

  if (filter === "This Year") {
    return selectedDate.getFullYear() === now.getFullYear();
  }

  if (filter === "Range") {
    const selectedStart = startOfDay(selectedDate);

    if (fromDate) {
      const from = startOfDay(new Date(fromDate));

      if (selectedStart < from) return false;
    }

    if (toDate) {
      const to = endOfDay(new Date(toDate));

      if (selectedStart > to) return false;
    }

    return true;
  }

  return true;
}

function isSameDay(dateOne, dateTwo) {
  return (
    dateOne.getFullYear() === dateTwo.getFullYear() &&
    dateOne.getMonth() === dateTwo.getMonth() &&
    dateOne.getDate() === dateTwo.getDate()
  );
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

function getSaleValue(sale, key) {
  if (key === "revenue") {
    return Number(sale.revenue || sale.totalAmount || sale.amount || 0);
  }

  if (key === "quantity") {
    return Number(sale.quantity || sale.qty || 0);
  }

  return Number(sale[key] || 0);
}

function groupByDate(data, key) {
  const map = {};

  data.forEach((sale) => {
    const label = sale.date || "No Date";
    map[label] = (map[label] || 0) + getSaleValue(sale, key);
  });

  return Object.entries(map)
    .map(([label, value]) => ({
      label: label === "No Date" ? label : label.slice(5),
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function groupByProduct(data) {
  const map = {};

  data.forEach((sale) => {
    const productName =
      sale.productName || sale.product || sale.itemName || "Unnamed Product";

    const category = sale.category || "General";
    const quantity = Number(sale.quantity || sale.qty || 0);
    const revenue = Number(sale.revenue || sale.totalAmount || sale.amount || 0);
    const cost = Number(sale.cost || 0);

    if (!map[productName]) {
      map[productName] = {
        productName,
        category,
        quantity: 0,
        revenue: 0,
        cost: 0,
      };
    }

    map[productName].quantity += quantity;
    map[productName].revenue += revenue;
    map[productName].cost += cost;
  });

  return Object.values(map).sort((a, b) => b.revenue - a.revenue);
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

function Chart({ title, subtitle, data, moneyMode }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div style={styles.card}>
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
          <div key={item.label} style={styles.barItem}>
            <div style={styles.barTrack}>
              <div
                style={{
                  ...styles.barFill,
                  height: `${Math.max((item.value / max) * 100, 8)}%`,
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
    <div style={styles.infoBox}>
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
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 18,
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