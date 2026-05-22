import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
        localStorage.setItem("auth_token", "dev-token");
        navigate("/dashboard");
        return;
      }

      const response = await axios.post(`${API}/auth/login`, form);

      localStorage.setItem("auth_token", response.data.token);

      if (response.data.user) {
        localStorage.setItem("user_data", JSON.stringify(response.data.user));
      }

      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2D2D2D]">NexBill ERP</h1>
          <p className="text-[#8B7355] mt-2">
            Professional Billing Management
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-4 border border-[#D6D3D1] rounded-2xl"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-4 border border-[#D6D3D1] rounded-2xl"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C6A969] hover:bg-[#8B7355] text-white py-4 rounded-2xl font-semibold transition"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;