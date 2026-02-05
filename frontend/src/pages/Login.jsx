import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from '../api'

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);

      if (res.data && res.data.user && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.dispatchEvent(new Event('auth-change'));

        alert(`✅ Login successful! Welcome ${res.data.user.name}`);

        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate(from === "/login" ? "/" : from);
        }
      } else {
        alert("❌ Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
      alert(`❌ ${err.response?.data?.message || "Login failed"}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-primary-50/50 to-surface-muted">
      <div className="w-full max-w-md bg-surface-elevated p-8 sm:p-10 rounded-2xl shadow-soft-lg border border-surface-border">
        <h2 className="text-2xl font-bold mb-2 text-center text-slate-800">Welcome back</h2>
        <p className="text-center text-slate-500 text-sm mb-8">Sign in to access your profile</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input-field"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-soft hover:shadow-primary"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center mt-6 text-slate-500">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-primary font-semibold hover:text-primary-dark hover:underline transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}