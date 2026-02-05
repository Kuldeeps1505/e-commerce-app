import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X, Globe, User, UserCircle } from 'lucide-react'
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate} from "react-router-dom";

const categories = [
  'All Categories',
  'Ayurveda & Herbal',
  'Electronics',
  'Agriculture',
  'Home Accessories',
  'Textiles',
  'Machinery',
  'Chemicals',
  'Food Products'
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null);
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

  const handleSearch = (e) => {
  e.preventDefault()

  const params = new URLSearchParams()

  if (searchQuery.trim()) {
    params.append("search", searchQuery.trim())
  }

  if (selectedCategory !== "All Categories") {
    params.append("category", selectedCategory)
  }

  navigate(`/products?${params.toString()}`)
}

  
  

  return (
    <nav className="bg-surface-elevated/95 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-primary">
              <span className="text-white font-bold text-lg sm:text-xl">B2B</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-slate-800 hidden sm:block">TradeHub</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
             <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-r-0 border-surface-border rounded-l-xl focus:outline-none bg-primary-50 text-slate-700 text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search products / services"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-surface-border focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-r-xl text-slate-800 placeholder-slate-400"
            />
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-r-xl hover:bg-primary-dark transition-colors shadow-soft">
              <Search size={20} />
            </button>
          </form>

          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <Link to="/profile" className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary transition-colors font-medium">
                <UserCircle size={20} className="text-primary" />
                <span>My Profile</span>
              </Link>
            ) : (
              <button onClick={() => navigate("/login")} className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors font-medium">
                <User size={18} />
                <span>Login</span>
              </button>
            )}
           
          </div>

          <button
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-primary-50 hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-surface-border bg-surface-muted/50">
            <form onSubmit={handleSearch} className="mb-4 px-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-surface-border rounded-xl mb-2 bg-white text-slate-700 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-r-0 border-surface-border rounded-l-xl text-slate-800"
                />
                <button type="submit" className="bg-primary text-white px-4 py-2.5 rounded-r-xl">
                  <Search size={20} />
                </button>
              </div>
            </form>
            <div className="space-y-2 px-1">
              {isLoggedIn ? (
                <Link to="/profile" className="flex items-center gap-2 w-full px-4 py-3 hover:bg-primary-50 rounded-xl font-medium text-slate-700 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <UserCircle size={20} className="text-primary" />
                  My Profile
                </Link>
              ) : (
                <button className="flex items-center gap-2 w-full px-4 py-3 hover:bg-primary-50 rounded-xl font-medium text-slate-700 hover:text-primary transition-colors" onClick={() => { setIsMenuOpen(false); navigate("/login"); }}>
                  <User size={20} />
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
