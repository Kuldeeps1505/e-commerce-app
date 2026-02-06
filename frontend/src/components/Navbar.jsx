import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X, Globe, User, UserCircle } from 'lucide-react'
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Category from '../../../backend/models/Category';
//import {useNavigate} from "react-router-dom";
import api from '../api'


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const navigate = useNavigate()

   const syncAuth = () => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    } else {
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  useEffect(() => {
    syncAuth()
    window.addEventListener("auth-change", syncAuth)
    return () => window.removeEventListener("auth-change", syncAuth)
  }, [])

  
  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  fetchCategories();
}, []);

  const handleSearch = async () => {
  if (!search.trim()) return

  try {
    const res = await api.get(
      `/products/search-one?name=${encodeURIComponent(search)}`
    )

    // redirect to product detail page
    navigate(`/product/${res.data.name}`)
  } catch (err) {
    if (err.response?.status === 404) {
      toast.error("Product not available. Try another.")
    } else {
      toast.error("Something went wrong")
    }
  }
}


  
  

  return (
  <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm">
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-3 group">
           <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
           <span className="text-white font-extrabold text-lg">B2B</span>
           </div>
            <span className="hidden sm:block font-bold text-xl text-slate-800 tracking-tight">
           TradeHub
           </span>
          </Link>

    <form onSubmit={handleSearch} className="flex gap-3">
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="border rounded-lg px-3"
  >
    <option>All Categories</option>
    {categories.map(cat => (
      <option key={cat._id}>{cat.name}</option>
    ))}
  </select>

  <input
    type="text"
    placeholder="Search products..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border rounded-lg px-4"
  />

  <button  type="submit" className="btn-primary">
    Search
  </button>
</form>


 <div className="hidden lg:flex items-center gap-4">
  {isLoggedIn ? (
    <Link
      to="/profile"
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary transition-all font-medium"
    >
      <UserCircle size={20} />
      My Profile
    </Link>
  ) : (
    <button
      onClick={() => navigate("/login")}
      className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all shadow-md"
    >
      Login
    </button>
  )}
</div>
      <button
  className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-primary-50 transition"
  onClick={() => setIsMenuOpen(!isMenuOpen)}
>
  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
</button>
        </div>
    {isMenuOpen && (
  <div className="lg:hidden mt-3 p-4 rounded-2xl bg-white shadow-lg border border-slate-200 animate-[fadeIn_0.2s_ease-out]">
    
    <form onSubmit={handleSearch} className="space-y-3">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-slate-200"
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <div className="flex">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-l-xl border border-r-0 border-slate-200"
        />
        <button className="px-4 bg-primary text-white rounded-r-xl">
          <Search size={18} />
        </button>
      </div>
    </form>

    <div className="mt-4">
      {isLoggedIn ? (
        <Link
          to="/profile"
          onClick={() => setIsMenuOpen(false)}
          className="block w-full text-center py-3 rounded-xl bg-slate-50 hover:bg-primary-50 transition"
        >
          My Profile
        </Link>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 rounded-xl bg-primary text-white"
        >
          Login
        </button>
      )}
    </div>

  </div>
)}

   </div>     
    </nav>
  )
}
