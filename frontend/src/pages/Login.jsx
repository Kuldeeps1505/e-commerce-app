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
     <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-primary-50/60 to-surface-muted">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-slate-200">
        <h2 className="text-3xl font-bold mb-2 text-center text-slate-900 drop-shadow-sm">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Sign in to access your profile</p>

        <form onSubmit={(e) => handleSubmit(e, form)} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/40 focus:border-primary transition outline-none bg-white/70"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/40 focus:border-primary transition outline-none bg-white/70"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark shadow-md hover:shadow-lg transition-all"
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








    