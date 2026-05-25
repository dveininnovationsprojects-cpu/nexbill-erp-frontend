import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    navigate("/login");
  };

  const stats = [
    {
      title: "Total Invoices",
      value: "128",
      bg: "bg-[#E8DCCF]",
    },
    {
      title: "Paid",
      value: "94",
      bg: "bg-[#EFE7DE]",
    },
    {
      title: "Pending",
      value: "18",
      bg: "bg-[#F8F5F2]",
    },
    {
      title: "Revenue",
      value: "₹ 4,85,000",
      bg: "bg-[#E8DCCF]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <header className="bg-white shadow-md px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">NexBill ERP</h1>
          <p className="text-[#8B7355]">Billing Dashboard</p>
        </div>

        <button
          onClick={logout}
          className="bg-[#C6A969] hover:bg-[#8B7355] text-white px-6 py-3 rounded-2xl"
        >
          Logout
        </button>
      </header>

      <main className="p-8">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {stats.map((item, index) => (
            <div
              key={index}
              className={`${item.bg} rounded-3xl shadow-md p-6`}
            >
              <h3 className="text-[#8B7355]">{item.title}</h3>
              <p className="text-3xl font-bold text-[#2D2D2D] mt-3">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-md p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6 text-[#2D2D2D]">
            Quick Actions
          </h2>

          <div className="flex flex-col md:flex-row gap-5">
            <button
              onClick={() => navigate("/invoices/create")}
              className="bg-[#C6A969] text-white px-8 py-5 rounded-2xl"
            >
              Create Invoice
            </button>

            <button
              onClick={() => navigate("/invoices/history")}
              className="bg-[#8B7355] text-white px-8 py-5 rounded-2xl"
            >
              Invoice History
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-[#2D2D2D]">
            Recent Activity
          </h2>

          <div className="space-y-4">
            <div className="bg-[#EFE7DE] rounded-2xl p-5 flex justify-between">
              <span>Invoice INV-1001 created</span>
              <span className="text-[#8B7355]">Today</span>
            </div>

            <div className="bg-[#EFE7DE] rounded-2xl p-5 flex justify-between">
              <span>Invoice INV-1002 paid</span>
              <span className="text-[#8B7355]">Yesterday</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;