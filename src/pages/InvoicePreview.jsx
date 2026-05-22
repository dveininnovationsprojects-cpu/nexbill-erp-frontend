import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const API = import.meta.env.VITE_API_URL;

function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [invoice, setInvoice] = useState(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
        setInvoice({
          id,
          invoiceNumber: `INV-${id}`,
          date: "2026-05-22",
          customer: {
            name: "Ahamed",
            email: "itsahamed515@gmail.com",
            phone: "9876543210",
          },
          paymentMethod: "UPI",
          notes: "Thank you for your business.",
          items: [
            {
              name: "Laptop",
              quantity: 1,
              price: 50000,
            },
            {
              name: "Mouse",
              quantity: 2,
              price: 1200,
            },
          ],
          subtotal: 52400,
          discount: 5,
          tax: 18,
        });
        return;
      }

      const response = await axios.get(
        `${API}/invoices/${id}`,
        authHeaders
      );

      setInvoice(response.data);
    } catch {
      alert("Failed to load invoice");
    }
  };

  const downloadPDF = async () => {
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

  const sendEmail = async () => {
    if (!email || !email.includes("@")) {
      alert("Enter valid email");
      return;
    }

    setSending(true);

    try {
      if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
        alert("Invoice email sent");
        setSending(false);
        return;
      }

      await axios.post(
        `${API}/invoices/${id}/email`,
        { email },
        authHeaders
      );

      alert("Invoice email sent");
    } catch {
      alert("Email sending failed");
    } finally {
      setSending(false);
    }
  };

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#C6A969] border-t-transparent"></div>
      </div>
    );
  }

  const discountAmount = (invoice.subtotal * invoice.discount) / 100;
  const taxableAmount = invoice.subtotal - discountAmount;
  const taxAmount = (taxableAmount * invoice.tax) / 100;
  const total = taxableAmount + taxAmount;

  return (
    <div className="min-h-screen bg-[#F8F5F2] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#8B7355] text-white px-6 py-3 rounded-2xl"
          >
            Dashboard
          </button>

          <button
            onClick={downloadPDF}
            className="bg-[#C6A969] text-white px-6 py-3 rounded-2xl"
          >
            Download PDF
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#2D2D2D] text-white px-6 py-3 rounded-2xl"
          >
            Print Invoice
          </button>
        </div>

        {/* Email */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Send Invoice Email</h2>

          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Customer email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-4 border border-[#D6D3D1] rounded-2xl"
            />

            <button
              onClick={sendEmail}
              disabled={sending}
              className="bg-[#C6A969] text-white px-8 rounded-2xl"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div
          ref={printRef}
          className="bg-white rounded-3xl shadow-xl p-10"
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-bold text-[#2D2D2D]">
                NexBill ERP
              </h1>
              <p className="text-[#8B7355] mt-2">
                Professional Billing Solution
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-3xl font-bold text-[#C6A969]">
                INVOICE
              </h2>
              <p className="mt-2">#{invoice.invoiceNumber}</p>
              <p>{invoice.date}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="font-bold text-lg mb-3">Bill To</h3>
              <p>{invoice.customer?.name}</p>
              <p>{invoice.customer?.email}</p>
              <p>{invoice.customer?.phone}</p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Payment Info</h3>
              <p>{invoice.paymentMethod}</p>
            </div>
          </div>

          {/* Items */}
          <div className="overflow-x-auto mb-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#EFE7DE]">
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Qty</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Total</th>
                </tr>
              </thead>

              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4">{item.name}</td>
                    <td className="p-4">{item.quantity}</td>
                    <td className="p-4">₹ {item.price}</td>
                    <td className="p-4">
                      ₹ {item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="max-w-md ml-auto space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹ {invoice.subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>₹ {discountAmount}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹ {taxAmount}</span>
            </div>

            <div className="flex justify-between text-2xl font-bold text-[#C6A969] border-t pt-4">
              <span>Total</span>
              <span>₹ {total}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-10 border-t pt-8">
            <h3 className="font-bold mb-3">Notes</h3>
            <p>{invoice.notes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreview;