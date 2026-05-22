import { useEffect, useState } from "react";
import CustomerManagement from "./pages/CustomerManagement";
import SalesAnalytics from "./pages/SalesAnalytics";
import ReportsExport from "./pages/ReportsExport";

const CURRENT_USER_ROLE = "admin"; // admin or cashier

function App() {
  const [activePage, setActivePage] = useState("customers");
  const [sales, setSales] = useState([]);

  useEffect(() => {
    loadSalesData();

    window.addEventListener("storage", loadSalesData);

    return () => {
      window.removeEventListener("storage", loadSalesData);
    };
  }, []);

  function loadSalesData() {
    try {
      const savedSales = localStorage.getItem("erp_sales_records");
      setSales(savedSales ? JSON.parse(savedSales) : []);
    } catch {
      setSales([]);
    }
  }

  const menuItems = [
    {
      id: "customers",
      label: "Customer Management",
      icon: "👥",
    },
    {
      id: "sales",
      label: "Sales Dashboard & Analytics",
      icon: "📊",
    },
    {
      id: "reports",
      label: "Reports & Export",
      icon: "📄",
    },
  ];

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
          background: #F8F5F2;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .nexbill-sidebar {
            width: 100% !important;
            min-height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid #D6D3D1 !important;
          }

          .nexbill-shell {
            flex-direction: column !important;
          }

          .nexbill-main {
            padding: 22px 18px 40px !important;
          }
        }
      `}</style>

      <div className="nexbill-shell" style={styles.appShell}>
        <aside className="nexbill-sidebar" style={styles.sidebar}>
          <div style={styles.brandBlock}>
            <h2 style={styles.brandName}>NexBill ERP</h2>
            <p style={styles.brandSub}>Enterprise Suite</p>
          </div>

          <nav style={styles.sidebarMenu}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  loadSalesData();
                  setActivePage(item.id);
                }}
                style={{
                  ...styles.sidebarBtn,
                  ...(activePage === item.id ? styles.sidebarBtnActive : {}),
                }}
              >
                <span style={styles.sidebarIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="nexbill-main" style={styles.mainArea}>
          {activePage === "customers" && (
            <CustomerManagement role={CURRENT_USER_ROLE} />
          )}

          {activePage === "sales" && (
            <SalesAnalytics role={CURRENT_USER_ROLE} sales={sales} />
          )}

          {activePage === "reports" && (
            <ReportsExport role={CURRENT_USER_ROLE} sales={sales} />
          )}
        </main>
      </div>
    </>
  );
}

const styles = {
  appShell: {
    minHeight: "100vh",
    display: "flex",
    background: "#F8F5F2",
    color: "#2D2D2D",
  },

  sidebar: {
    width: 245,
    minHeight: "100vh",
    background: "#F4EFEB",
    borderRight: "1px solid #D6D3D1",
    padding: "24px 8px",
    flexShrink: 0,
  },

  brandBlock: {
    padding: "0 14px 26px",
    textAlign: "left",
  },

  brandName: {
    margin: 0,
    color: "#8B6B21",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: "left",
  },

  brandSub: {
    margin: "8px 0 0",
    color: "#2D2D2D",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.4,
    textAlign: "left",
  },

  sidebarMenu: {
    display: "grid",
    gap: 8,
  },

  sidebarBtn: {
    width: "100%",
    minHeight: 52,
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: 0,
    borderLeft: "4px solid transparent",
    background: "transparent",
    color: "#2D2D2D",
    padding: "0 14px",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.35,
  },

  sidebarBtnActive: {
    background: "#E7DFD9",
    borderLeftColor: "#E0BE61",
  },

  sidebarIcon: {
    width: 20,
    display: "inline-flex",
    justifyContent: "center",
    fontSize: 14,
    flexShrink: 0,
  },

  mainArea: {
    flex: 1,
    minWidth: 0,
    padding: "34px 38px 44px",
  },
};

export default App;