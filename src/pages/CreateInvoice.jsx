import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function CreateInvoice() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [invoice, setInvoice] = useState({
    customerId: "",
    paymentMethod: "Cash",
    notes: "",
    discount: 0,
    tax: 18,
  });

  const [items, setItems] = useState([
    {
      productId: "",
      quantity: 1,
      price: 0,
      name: "",
    },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  };

  const fetchData = async () => {
    try {
      if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
        setCustomers([
          { id: 1, name: "Ahamed" },
          { id: 2, name: "DVein Client" },
        ]);

        setProducts([
          { id: 1, name: "Laptop", price: 50000 },
          { id: 2, name: "Mouse", price: 1200 },
          { id: 3, name: "Keyboard", price: 2500 },
          { id: 4, name: "Monitor", price: 15000 },
        ]);

        return;
      }

      const [customerRes, productRes] = await Promise.all([
        axios.get(`${API}/customers`, authHeaders),
        axios.get(`${API}/products`, authHeaders),
      ]);

      setCustomers(customerRes.data);
      setProducts(productRes.data);
    } catch {
      alert("Failed to load customers/products");
    }
  };

  const handleInvoiceChange = (e) => {
    setInvoice({
      ...invoice,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];

    if (field === "productId") {
      const product = products.find((p) => p.id == value);

      updated[index].productId = value;
      updated[index].price = product?.price || 0;
      updated[index].name = product?.name || "";
    } else {
      updated[index][field] = value;
    }

    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
        price: 0,
        name: "",
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountAmount = (subtotal * invoice.discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * invoice.tax) / 100;
  const total = taxableAmount + taxAmount;

  const submitInvoice = async () => {
    if (!invoice.customerId) {
      alert("Please select customer");
      return;
    }

    if (items.some((item) => !item.productId)) {
      alert("Please select all products");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...invoice,
        items,
        subtotal,
        total,
      };

      if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
        navigate("/invoices/1001");
        return;
      }

      const response = await axios.post(
        `${API}/invoices`,
        payload,
        authHeaders
      );

      navigate(`/invoices/${response.data.id}`);
    } catch {
      alert("Invoice creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#2D2D2D]">
              Create Invoice
            </h1>
            <p className="text-[#8B7355] mt-2">
              Professional Billing Invoice Creation
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#C6A969] hover:bg-[#8B7355] text-white px-6 py-3 rounded-2xl"
          >
            Dashboard
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6">
              Invoice Details
            </h2>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Customer</label>
              <select
                name="customerId"
                value={invoice.customerId}
                onChange={handleInvoiceChange}
                className="w-full p-4 border border-[#D6D3D1] rounded-2xl"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <h3 className="text-xl font-bold mb-5">Products</h3>

            {items.map((item, index) => (
              <div
                key={index}
                className="grid md:grid-cols-4 gap-4 mb-4 bg-[#EFE7DE] p-5 rounded-2xl"
              >
                <select
                  value={item.productId}
                  onChange={(e) =>
                    handleItemChange(index, "productId", e.target.value)
                  }
                  className="p-3 rounded-xl"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", Number(e.target.value))
                  }
                  className="p-3 rounded-xl"
                />

                <input
                  type="number"
                  value={item.price}
                  readOnly
                  className="p-3 rounded-xl"
                />

                <button
                  onClick={() => removeItem(index)}
                  className="bg-red-500 text-white rounded-xl"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              onClick={addItem}
              className="bg-[#8B7355] text-white px-6 py-3 rounded-2xl"
            >
              Add Product
            </button>

            <div className="mt-8">
              <label className="block mb-2 font-medium">Payment Method</label>
              <select
                name="paymentMethod"
                value={invoice.paymentMethod}
                onChange={handleInvoiceChange}
                className="w-full p-4 border border-[#D6D3D1] rounded-2xl"
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            <div className="mt-6">
              <textarea
                name="notes"
                value={invoice.notes}
                onChange={handleInvoiceChange}
                rows="4"
                placeholder="Invoice notes..."
                className="w-full p-4 border border-[#D6D3D1] rounded-2xl"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-8 h-fit">
            <h2 className="text-2xl font-bold mb-6">Invoice Summary</h2>

            <input
              type="number"
              name="discount"
              value={invoice.discount}
              onChange={handleInvoiceChange}
              placeholder="Discount %"
              className="w-full p-4 border border-[#D6D3D1] rounded-2xl mb-4"
            />

            <input
              type="number"
              name="tax"
              value={invoice.tax}
              onChange={handleInvoiceChange}
              placeholder="Tax %"
              className="w-full p-4 border border-[#D6D3D1] rounded-2xl mb-6"
            />

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹ {subtotal}</span>
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

            <button
              onClick={submitInvoice}
              disabled={loading}
              className="w-full mt-8 bg-[#C6A969] hover:bg-[#8B7355] text-white py-4 rounded-2xl font-semibold"
            >
              {loading ? "Creating Invoice..." : "Create Invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateInvoice;