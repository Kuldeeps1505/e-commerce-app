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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-secondary-50/60 to-surface-muted">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-slate-200">
        <h2 className="text-3xl font-bold mb-2 text-center text-slate-900 drop-shadow-sm">Create Account</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Join TradeHub B2B Marketplace</p>

        <form onSubmit={(e) => handleSubmit(e, form)} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition outline-none bg-white/70"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition outline-none bg-white/70"
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
              className="px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition outline-none bg-white/70"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary-dark shadow-md hover:shadow-lg transition-all"
          >
            Sign Up
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