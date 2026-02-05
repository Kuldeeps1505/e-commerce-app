import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../api'

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {  
    e.preventDefault();
    try {
      const res = await api.post("/auth/signup", form);
      
      if (res.data && res.data.user) {
        alert(`✅ Signup successful! Welcome ${res.data.user.name}. Please login.`);
        navigate("/");
      } else {
        alert("❌ Signup failed");
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert(`❌ ${err.response?.data?.message || "Signup failed"}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-secondary-50/50 to-surface-muted">
      <div className="w-full max-w-md bg-surface-elevated p-8 sm:p-10 rounded-2xl shadow-soft-lg border border-surface-border">
        <h2 className="text-2xl font-bold mb-2 text-center text-slate-800">Create account</h2>
        <p className="text-center text-slate-500 text-sm mb-8">Join TradeHub B2B Marketplace</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="input-field"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
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
            className="w-full py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary-dark transition-all shadow-soft hover:shadow-secondary"
          >
            Sign up
          </button>
        </form>
        <p className="text-sm text-center mt-6 text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:text-primary-dark hover:underline transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}