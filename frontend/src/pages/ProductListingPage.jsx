import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, Filter, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../api'
import { Link } from "react-router-dom"
import { useSearchParams } from "react-router-dom"


//const relatedCategories = ['Ayurveda & Herbal', 'Electronics', 'Agriculture','Home Accessories', 'Textiles', 'Machinery', 'Chemical','Food Products']

export default function ProductListingPage() {
  const { categorySlug } = useParams()
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 10000])
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || "all")
  const [sortBy, setSortBy] = useState("relevance")

  const [searchParams] = useSearchParams()
  const search = searchParams.get("search") || "";
  const searchQuery = searchParams.get('search')
  const categoryParam = searchParams.get('category')

 const [category, setCategory] = useState(" ")

  const [categories, setCategories] = useState([])
   
   useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  fetchCategories();
}, []);



 useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true)

      const params = {}

      if (search) params.search = search
      if (category) params.category = category

      const res = await api.get("/products", { params })

      setProducts(res.data.products || [])
    } catch (err) {
      console.error("Failed to fetch products", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  fetchProducts()
}, [search, category])


  const toggleBusinessType = (type) => {
    setSelectedBusinessTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }
  
  const filteredProducts = products
  .filter(p => {
    // CATEGORY
    if (selectedCategory !== "all" && p.category?.slug !== selectedCategory) {
      return false
    }
    
     // SEARCH FILTER
  if (
    searchQuery &&
    !p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) {
    return false;
  }
  
    // PRICE
    if (p.price?.min > priceRange[1]) return false

    return true
  })
  .sort((a, b) => {
    if (sortBy === "price-low") return a.price.min - b.price.min
    if (sortBy === "price-high") return b.price.min - a.price.min
    if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt)
    return 0 // relevance
  })

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-surface-elevated border-b border-surface-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-sm text-slate-500">
             <Link
              to="/"
               className="hover:text-primary transition-colors font-medium"
              >
              Home
            </Link>
             {" / "}
             <span className="text-slate-800 font-medium capitalize">
           {categorySlug?.replace("-", " ")}
           </span>
         </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">
            {categorySlug?.replace('-', ' ')} Products
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-surface-border rounded-xl text-slate-700 hover:bg-primary-50 transition-colors"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        <div className="flex gap-6">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-surface-elevated rounded-2xl shadow-soft border border-surface-border p-4 sticky top-20">
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h3 className="font-semibold text-slate-800">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg hover:bg-primary-50 text-slate-600">
                  <X size={20} />
                </button>
              </div>

             <div className="mb-6">
  

  <ul className="space-y-2">
    {/* ALL */}
    <li>
      <button
        onClick={() => setSelectedCategory("all")}
        className={`text-sm font-medium transition ${
          selectedCategory === "all"
            ? "text-primary"
            : "text-slate-600 hover:text-primary"
        }`}
      >
        All Categories
      </button>
    </li>

    {/* DYNAMIC CATEGORIES */}
    {categories.map((cat) => (
      <li key={cat._id}>
        <button
          onClick={() => {
            setSelectedCategory(cat.slug);
            navigate(
              `/products?category=${encodeURIComponent(cat.name)}&search=${encodeURIComponent(search)}`
            );
          }}
          className={`text-sm font-medium transition ${
            selectedCategory === cat.slug
              ? "text-primary"
              : "text-slate-600 hover:text-primary"
          }`}
        >
          {cat.name}
        </button>
      </li>
    ))}
  </ul>
</div>










              

              <div className="mb-6 border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
                <button
                 onClick={() => {
                  setSelectedCategory("all")
                    setSelectedBusinessTypes([])
                  setPriceRange([0, 10000])
                    setSortBy("relevance")
                }}
                 className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg"
                    >
                  Clear All Filters
                   </button>

              
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
                </div>
                <select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
  className="px-4 py-2 border rounded-lg text-sm"
>
  <option value="relevance">Sort by: Relevance</option>
  <option value="price-low">Price: Low to High</option>
  <option value="price-high">Price: High to Low</option>
  <option value="newest">Newest First</option>
</select>

              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-gray-600">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-gray-600 mb-2">No products available yet.</div>
                <p className="text-sm text-gray-500">Check back soon for new products!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
