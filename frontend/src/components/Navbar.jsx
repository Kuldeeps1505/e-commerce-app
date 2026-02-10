import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Menu, 
  X, 
  User, 
  UserCircle, 
  LogOut, 
  Settings, 
  ShoppingBag, 
  Heart,
  Bell,
  ChevronDown,
  Package,
  MessageSquare,
  LayoutGrid,
  Clock
} from 'lucide-react'
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import api from '../api'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [categories, setCategories] = useState([])
  const [notifications, setNotifications] = useState(0)
  
  // Search autocomplete states
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  
  const navigate = useNavigate()
  
  const userMenuRef = useRef(null)
  const categoryMenuRef = useRef(null)
  const searchDropdownRef = useRef(null)

  // Sync authentication state
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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories")
        setCategories(res.data)
      } catch (err) {
        console.error("Failed to load categories", err)
      }
    }
    fetchCategories()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryMenuOpen(false)
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load recent searches', e)
      }
    }
  }, [])

  // Debounced search for autocomplete
  const debounceTimer = useRef(null)
  
  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSearchDropdown(true)

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Fetch suggestions after 300ms delay
    if (value.trim().length >= 2) {
      setLoadingSuggestions(true)
      debounceTimer.current = setTimeout(() => {
        fetchSearchSuggestions(value)
      }, 300)
    } else {
      setSearchSuggestions([])
      setLoadingSuggestions(false)
    }
  }

  // Fetch search suggestions from API
  const fetchSearchSuggestions = async (query) => {
    try {
      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''
      const res = await api.get(`/products/search?q=${encodeURIComponent(query)}${categoryParam}&limit=5`)
      
      // Format suggestions
      const suggestions = res.data.products?.map(product => ({
        type: 'product',
        name: product.name,
        category: product.category,
        price: product.price?.min || product.price,
        image: product.image || product.images?.[0],
        slug: product.slug || product._id
      })) || []

      setSearchSuggestions(suggestions)
    } catch (err) {
      console.error('Failed to fetch suggestions', err)
      setSearchSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    if (suggestion.type === 'product' && suggestion.slug) {
      // Navigate to product page
      navigate(`/product/${suggestion.slug}`)
      addToRecentSearches(suggestion.name)
      setSearchQuery('')
      setShowSearchDropdown(false)
    } else {
      // Set as search query
      setSearchQuery(suggestion.name)
      setShowSearchDropdown(false)
      handleSearchSubmit(suggestion.name)
    }
  }

  // Add to recent searches
  const addToRecentSearches = (query) => {
    if (!query.trim()) return
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  // Handle search submit
  const handleSearchSubmit = (query = searchQuery) => {
    if (!query.trim()) return
    
    addToRecentSearches(query)
    const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''
    navigate(`/products?search=${encodeURIComponent(query)}${categoryParam}`)
    setShowSearchDropdown(false)
  }

  // Handle search form submit
  const handleSearch = async (e) => {
    e.preventDefault()
    handleSearchSubmit()
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUser(null)
    window.dispatchEvent(new Event("auth-change"))
    navigate("/")
  }

  // Get user role display
  const getUserRole = () => {
    if (!user) return ''
    return user.role === 'supplier' ? 'Supplier' : user.role === 'buyer' ? 'Buyer' : 'Admin'
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary-dark to-primary text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <span className="hidden sm:block">🌍 Global B2B Marketplace</span>
              <span className="text-xs opacity-90">Trusted by 2,500+ Suppliers</span>
            </div>
            <div className="flex items-center gap-4">
              {!isLoggedIn && (
                <>
                  <Link to="/signup" className="hover:underline text-xs sm:text-sm">
                    Register
                  </Link>
                  <span className="opacity-50">|</span>
                  <Link to="/login" className="hover:underline text-xs sm:text-sm">
                    Login
                  </Link>
                </>
              )}
              {isLoggedIn && (
                <span className="text-xs sm:text-sm">
                  Welcome, <span className="font-semibold">{user?.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-blue-900 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <span className="text-white font-black text-lg">B2B</span>
            </div>
            <div className="hidden sm:block">
              <span className="block font-black text-xl text-slate-800 tracking-tight leading-none">
                TradeHub
              </span>
              <span className="block text-xs text-slate-500 font-medium">
                Global Marketplace
              </span>
            </div>
          </Link>

          {/* Category Dropdown + Search Bar (Desktop) */}
          <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex w-full shadow-md rounded-xl overflow-hidden border border-slate-200 relative">
              {/* Category Selector */}
              <div className="relative" ref={categoryMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 transition-colors whitespace-nowrap"
                >
                  <LayoutGrid size={18} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {selectedCategory === 'all' 
                      ? 'All Categories' 
                      : categories.find(c => c.slug === selectedCategory)?.name || 'All Categories'
                    }
                  </span>
                  <ChevronDown size={16} className={`text-slate-500 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Category Dropdown */}
                {isCategoryMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 overflow-y-auto z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all')
                        setIsCategoryMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-slate-100 font-medium text-slate-700"
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input with Autocomplete */}
              <div className="flex-1 relative" ref={searchDropdownRef}>
                <input
                  type="text"
                  placeholder="Search for products, suppliers, categories..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="w-full px-4 py-3 outline-none text-sm bg-white"
                />

                {/* Search Suggestions Dropdown */}
                {showSearchDropdown && (searchQuery.trim() || recentSearches.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 overflow-y-auto z-50">
                    
                    {/* Autocomplete Suggestions */}
                    {searchSuggestions.length > 0 && (
                      <div className="p-2">
                        <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                          Suggestions
                        </p>
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-3 group"
                          >
                            {suggestion.type === 'product' ? (
                              <>
                                {suggestion.image && (
                                  <img
                                    src={suggestion.image}
                                    alt={suggestion.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-800 group-hover:text-primary">
                                    {suggestion.name}
                                  </p>
                                  {suggestion.category && (
                                    <p className="text-xs text-slate-500">
                                      in {suggestion.category}
                                    </p>
                                  )}
                                </div>
                                {suggestion.price && (
                                  <p className="text-sm font-bold text-primary">
                                    ${suggestion.price}
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <Search size={16} className="text-slate-400 group-hover:text-primary" />
                                <span className="text-sm text-slate-700 group-hover:text-primary flex-1">
                                  {suggestion.name}
                                </span>
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recent Searches */}
                    {!searchQuery.trim() && recentSearches.length > 0 && (
                      <div className="p-2 border-t border-slate-100">
                        <div className="flex items-center justify-between px-3 py-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase">
                            Recent Searches
                          </p>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setSearchQuery(search)
                              setShowSearchDropdown(false)
                              handleSearchSubmit(search)
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3 group"
                          >
                            <Clock size={16} className="text-slate-400 group-hover:text-primary" />
                            <span className="text-sm text-slate-700 group-hover:text-primary flex-1">
                              {search}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {searchQuery.trim() && searchSuggestions.length === 0 && loadingSuggestions === false && (
                      <div className="p-8 text-center">
                        <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-600 font-medium">No suggestions found</p>
                        <p className="text-xs text-slate-500 mt-1">Try a different search term</p>
                      </div>
                    )}

                    {/* Loading */}
                    {loadingSuggestions && (
                      <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-500 mt-3">Searching...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button 
                type="submit"
                className="px-6 bg-primary hover:bg-primary-dark text-white transition-colors flex items-center gap-2 font-semibold"
              >
                <Search size={18} />
                <span className="hidden xl:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            
            {isLoggedIn ? (
              <>
                {/* Quick Actions */}
                <Link
                  to="/category/all"
                  className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                  title="Products"
                >
                  <ShoppingBag size={22} className="text-slate-600 group-hover:text-primary transition-colors" />
                  <span className="text-xs text-slate-600 mt-1">Products</span>
                </Link>

                

                <Link
                  to="/messages"
                  className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 transition-colors group relative"
                  title="Messages"
                >
                  <MessageSquare size={22} className="text-slate-600 group-hover:text-primary transition-colors" />
                  <span className="text-xs text-slate-600 mt-1">Messages</span>
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notifications}
                    </span>
                  )}
                </Link>

                {/* User Menu Dropdown */}
                <div className="relative ml-2" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                      <UserCircle size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">
                        {user?.name?.split(' ')[0] || 'User'}
                      </p>
                      <p className="text-xs text-slate-500">User</p>
                    </div>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-800">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 transition-colors text-slate-700"
                      >
                        <User size={18} />
                        <span className="text-sm font-medium">My Profile</span>
                      </Link>

                      {user?.role === 'supplier' && (
                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 transition-colors text-slate-700"
                        >
                          <Package size={18} />
                          <span className="text-sm font-medium">My Products</span>
                        </Link>
                      )}

                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 transition-colors text-slate-700"
                      >
                        <ShoppingBag size={18} />
                        <span className="text-sm font-medium">My Orders</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 transition-colors text-slate-700"
                      >
                        <Settings size={18} />
                        <span className="text-sm font-medium">Settings</span>
                      </Link>

                      <hr className="my-2 border-slate-100" />

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600"
                      >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl border-2 border-primary text-primary hover:bg-primary-50 transition-all font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white transition-all shadow-md font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 animate-[slideDown_0.2s_ease-out]">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4 space-y-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm"
                />
                <button 
                  type="submit"
                  className="px-5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Mobile Menu Items */}
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <User size={20} />
                  <span className="font-medium">My Profile</span>
                </Link>

                <Link
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <ShoppingBag size={20} />
                  <span className="font-medium">Products</span>
                </Link>

                

                <Link
                  to="/messages"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <MessageSquare size={20} />
                  <span className="font-medium">Messages</span>
                  {notifications > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {notifications}
                    </span>
                  )}
                </Link>

                {user?.role === 'supplier' && (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <Package size={20} />
                    <span className="font-medium">My Products</span>
                  </Link>
                )}

                <Link
                  to="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Settings size={20} />
                  <span className="font-medium">Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center py-3 rounded-xl border-2 border-primary text-primary hover:bg-primary-50 transition-colors font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  )
}