import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function InvoiceHistory() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [search, status, invoices]);

  const fetchInvoices = async () => {
    try {
      if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
        const mockInvoices = [
          {
            id: 1001,
            invoiceNumber: "INV-1001",
            customer: { name: "Ahamed" },
            amount: 12000,
            status: "Paid",
            date: "2026-05-22",
          },
          {
            id: 1002,
            invoiceNumber: "INV-1002",
            customer: { name: "DVein Client" },
            amount: 18500,
            status: "Pending",
            date: "2026-05-21",
          },
          {
            id: 1003,
            invoiceNumber: "INV-1003",
            customer: { name: "Tech Client" },
            amount: 25000,
            status: "Paid",
            date: "2026-05-20",
          },
        ];

        setInvoices(mockInvoices);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API}/invoices`,
        authHeaders
      );

      setInvoices(response.data);
    } catch {
      alert("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let data = [...invoices];

    if (search) {
      data = data.filter((invoice) => {
        const customerName =
          invoice.customer?.name || invoice.customer || "";

        return (
          invoice.invoiceNumber
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          customerName
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      });
    }

    if (status !== "All") {
      data = data.filter((invoice) => invoice.status === status);
    }

    setFilteredInvoices(data);
  };

  const downloadPDF = async (id) => {
    try {
      const response = await axios.get(
        `${API}/invoices/${id}/download`,
        {
          ...authHeaders,
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${id}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("PDF download failed");
    }
  };

  const resendEmail = async (id) => {
    try {
      if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
        alert("Invoice email resent");
        return;
      }

      await axios.post(
        `${API}/invoices/${id}/email`,
        {},
        authHeaders
      );

      alert("Invoice email resent");
    } catch {
      alert("Email sending failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#C6A969] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#2D2D2D]">
              Invoice History
            </h1>
            <p className="text-[#8B7355] mt-2">
              Manage all created invoices
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#C6A969] hover:bg-[#8B7355] text-white px-6 py-3 rounded-2xl"
          >
            Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search invoice / customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-4 border border-[#D6D3D1] rounded-2xl"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-4 border border-[#D6D3D1] rounded-2xl"
          >
            <option>All</option>
            <option>Paid</option>
            <option>Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-md p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#EFE7DE]">
                <th className="p-4 text-left">Invoice No</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b">
                  <td className="p-4">{invoice.invoiceNumber}</td>

                  <td className="p-4">
                    {invoice.customer?.name || invoice.customer}
                  </td>

                  <td className="p-4">{invoice.date}</td>

                  <td className="p-4">₹ {invoice.amount}</td>

                  <td className="p-4">
                    <span
                      className={`px-4 py-2 rounded-xl text-sm ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          navigate(`/invoices/${invoice.id}`)
                        }
                        className="bg-[#8B7355] text-white px-4 py-2 rounded-xl"
                      >
                        View
                      </button>

                      <button
                        onClick={() => downloadPDF(invoice.id)}
                        className="bg-[#C6A969] text-white px-4 py-2 rounded-xl"
                      >
                        PDF
                      </button>

                      <button
                        onClick={() => resendEmail(invoice.id)}
                        className="bg-[#2D2D2D] text-white px-4 py-2 rounded-xl"
                      >
                        Email
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-10 text-[#8B7355]">
              No invoices found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceHistory;