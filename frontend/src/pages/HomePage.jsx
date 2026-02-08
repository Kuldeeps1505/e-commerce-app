import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Package, Users, Globe, TrendingUp, ChevronLeft, ChevronRight, Star, ShoppingBag, Heart, Eye } from 'lucide-react'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

// Hero slides data
const heroSlides = [
  {
    id: 1,
    title: "Premium Global Products",
    subtitle: "Discover World-Class Quality",
    description: "Connect with verified suppliers across 150+ countries",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=800&fit=crop",
    cta: "Explore Now",
    gradient: "from-blue-900/90 via-blue-800/80 to-transparent"
  },
  {
    id: 2,
    title: "Sustainable Manufacturing",
    subtitle: "Building a Better Future",
    description: "Eco-friendly products from responsible suppliers",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&h=800&fit=crop",
    cta: "Learn More",
    gradient: "from-emerald-900/90 via-emerald-800/80 to-transparent"
  },
  {
    id: 3,
    title: "Innovation & Technology",
    subtitle: "Future-Ready Solutions",
    description: "Cutting-edge electronics and machinery",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=800&fit=crop",
    cta: "Shop Tech",
    gradient: "from-purple-900/90 via-purple-800/80 to-transparent"
  },
  {
    id: 4,
    title: "Artisan Craftsmanship",
    subtitle: "Handmade Excellence",
    description: "Authentic textiles and traditional products",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1920&h=800&fit=crop",
    cta: "View Collection",
    gradient: "from-amber-900/90 via-amber-800/80 to-transparent"
  }
]



const stats = [
  { icon: Package, label: 'Products Listed', value: '50,000+' },
  { icon: Users, label: 'Active Suppliers', value: '2,500+' },
  { icon: Globe, label: 'Countries Served', value: '150+' },
  { icon: TrendingUp, label: 'Daily Enquiries', value: '1,200+' }
]

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const slideIntervalRef = useRef(null)

  // Helper function to format price
  const formatPrice = (price) => {
    if (!price) return 'N/A'
    if (typeof price === 'object') {
      const currency = price.currency || '$'
      if (price.min && price.max && price.min !== price.max) {
        return `${currency}${price.min} - ${currency}${price.max}`
      }
      return `${currency}${price.min || price.max || 'N/A'}`
    }
    return `$${price}`
  }

  // Fetch categories and featured products
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await api.get("/categories")
        const categoriesData = categoriesRes.data || []
        setCategories(categoriesData)

        // Fetch featured products - one product from each of the first 4 categories
        if (categoriesData.length > 0) {
          const productsPromises = categoriesData.slice(0, 4).map(async (category) => {
            try {
              const productsRes = await api.get(`/products?category=${category.slug}&limit=1`)
              const productsArray = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.products || []
              return productsArray.length > 0 ? productsArray[0] : null
            } catch (err) {
              console.error(`Failed to load products for ${category.name}`, err)
              return null
            }
          })

          const products = await Promise.all(productsPromises)
          // Filter out null/undefined values and ensure products have required fields
          const validProducts = products.filter(p => p && p.name && (p.id || p._id))
          console.log('Featured products loaded:', validProducts)
          setFeaturedProducts(validProducts)
        }
        
      } catch (err) {
        console.error("Failed to load data", err)
        setFeaturedProducts([]) // Set empty array on error
      } finally {
        setLoading(false)
        setProductsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Auto-slide functionality
  useEffect(() => {
    startAutoSlide()
    return () => stopAutoSlide()
  }, [])

  const startAutoSlide = () => {
    stopAutoSlide()
    slideIntervalRef.current = setInterval(() => {
      nextSlide()
    }, 5000) // Change slide every 5 seconds
  }

  const stopAutoSlide = () => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current)
    }
  }

  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
    startAutoSlide() // Restart timer when manually changing
  }

  // Slide animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  // Featured Products Carousel - now with 4 products total
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [productsPerView, setProductsPerView] = useState(3)

  // Update productsPerView on window resize
  useEffect(() => {
    const updateProductsPerView = () => {
      setProductsPerView(window.innerWidth >= 768 ? 3 : 1)
    }
    
    updateProductsPerView()
    window.addEventListener('resize', updateProductsPerView)
    return () => window.removeEventListener('resize', updateProductsPerView)
  }, [])

  const nextProducts = () => {
    if (featuredProducts.length <= productsPerView) return
    setCurrentProductIndex((prev) => 
      (prev + 1) % featuredProducts.length
    )
  }

  const prevProducts = () => {
    if (featuredProducts.length <= productsPerView) return
    setCurrentProductIndex((prev) => 
      (prev - 1 + featuredProducts.length) % featuredProducts.length
    )
  }

  // Calculate visible products based on current index
  const getVisibleProducts = () => {
    if (!featuredProducts || featuredProducts.length === 0) return []
    if (featuredProducts.length <= productsPerView) return featuredProducts
    
    const visible = []
    for (let i = 0; i < Math.min(productsPerView, featuredProducts.length); i++) {
      const product = featuredProducts[(currentProductIndex + i) % featuredProducts.length]
      if (product) visible.push(product)
    }
    return visible
  }

  const visibleProducts = getVisibleProducts()

  // Helper function to safely get category name
  const getCategoryName = (category) => {
    if (typeof category === 'string') return category
    if (category && typeof category === 'object' && category.name) return category.name
    return 'Product'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      {/* HERO SLIDER */}
      <section className="relative h-[90vh] overflow-hidden bg-slate-900">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 }
            }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].gradient}`} />
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-6 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-2xl"
                >
                  <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
                    {heroSlides[currentSlide].title}
                  </h1>
                  <p className="text-2xl text-blue-100 font-semibold mb-3">
                    {heroSlides[currentSlide].subtitle}
                  </p>
                  <p className="text-lg text-white/90 mb-8">
                    {heroSlides[currentSlide].description}
                  </p>
                  <Link to ="/category/all" className="group inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all hover:scale-105">
                  <button className="group bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all hover:scale-105 flex items-center gap-3">
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={() => { prevSlide(); startAutoSlide(); }}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md hover:bg-white/20 p-4 rounded-full transition-all group"
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={() => { nextSlide(); startAutoSlide(); }}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md hover:bg-white/20 p-4 rounded-full transition-all group"
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                index === currentSlide
                  ? 'w-12 bg-white'
                  : 'w-3 bg-white/40 hover:bg-white/60'
              } h-3 rounded-full`}
            />
          ))}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative -mt-20 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-center hover:shadow-blue-500/20 transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <stat.icon className="text-white w-7 h-7" />
                </div>
                <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS CAROUSEL */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-2">
                Featured Products
              </h2>
              <p className="text-lg text-slate-600">Handpicked selections just for you</p>
            </div>
            <Link
              to="/category/all"
              className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:gap-4 transition-all group"
            >
              View All Products
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : !featuredProducts || featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-slate-600">No featured products available at the moment.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Show as grid if 4 or fewer products, otherwise carousel */}
              {featuredProducts.length <= 4 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.filter(product => product && product.name).map((product, index) => (
                    <motion.div
                      key={product.id || product._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-200 hover:border-blue-300 h-full">
                        {/* Image Container */}
                        <div className="relative overflow-hidden aspect-square">
                          <img
                            src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              Featured
                            </span>
                          </div>
                          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="bg-white p-2.5 rounded-full shadow-lg hover:bg-blue-50 transition-colors">
                              <Heart className="w-5 h-5 text-slate-700" />
                            </button>
                            <button className="bg-white p-2.5 rounded-full shadow-lg hover:bg-blue-50 transition-colors">
                              <Eye className="w-5 h-5 text-slate-700" />
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-6">
                          <p className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wider">
                            {getCategoryName(product.category)}
                          </p>
                          <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">
                            {product.name}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating || 4.5)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-slate-600">
                              {product.rating || '4.5'} {product.reviews ? `(${product.reviews})` : ''}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-black text-slate-900">
                              {formatPrice(product.price)}
                            </span>
                            <Link
                              to={`/product/${product.slug || product._id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <>
              {/* Carousel for more than 4 products */}
              <div className="overflow-hidden">
                <motion.div
                  animate={{ x: 0 }}
                  className="flex gap-6"
                >
                  {visibleProducts.filter(p => p).map((product, index) => (
                    <motion.div
                      key={product.id || product._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] group"
                    >
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-200 hover:border-blue-300">
                        {/* Image Container */}
                        <div className="relative overflow-hidden aspect-square">
                          <img
                            src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              Featured
                            </span>
                          </div>
                          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="bg-white p-2.5 rounded-full shadow-lg hover:bg-blue-50 transition-colors">
                              <Heart className="w-5 h-5 text-slate-700" />
                            </button>
                            <button className="bg-white p-2.5 rounded-full shadow-lg hover:bg-blue-50 transition-colors">
                              <Eye className="w-5 h-5 text-slate-700" />
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-6">
                          <p className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wider">
                            {getCategoryName(product.category)}
                          </p>
                          <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">
                            {product.name}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating || 4.5)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-slate-600">
                              {product.rating || '4.5'} {product.reviews ? `(${product.reviews})` : ''}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-black text-slate-900">
                              {formatPrice(product.price)}
                            </span>
                            <Link
                              to={`/product/${product.slug || product._id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Navigation Buttons - Only show if more than productsPerView */}
              {featuredProducts.length > productsPerView && (
                <>
                  <button
                    onClick={prevProducts}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-50 p-3 rounded-full shadow-xl border border-slate-200 transition-all hover:scale-110 z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-slate-700" />
                  </button>
                  <button
                    onClick={nextProducts}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-50 p-3 rounded-full shadow-xl border border-slate-200 transition-all hover:scale-110 z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-slate-700" />
                  </button>
                </>
              )}
              </>
              )}
            </div>
          )}

          {/* Mobile View All Link */}
          <div className="mt-8 text-center md:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-blue-600 font-bold"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORY SHOWCASE */}
      <section className="py-24 bg-gradient-to-br from-slate-100 to-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore our wide range of products across multiple categories
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {categories.slice(0, 8).map((category) => (
                <motion.div
                  key={category.slug}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/category/all"
              className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-all hover:scale-105"
            >
              Browse All Categories
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-slate-600">
              We connect you with the world's best suppliers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔒",
                title: "Verified Suppliers",
                description: "Every supplier is thoroughly vetted and verified for quality and reliability"
              },
              {
                icon: "🌍",
                title: "Global Reach",
                description: "Access products from over 150 countries and expand your business worldwide"
              },
              {
                icon: "💎",
                title: "Premium Quality",
                description: "Only the finest products that meet international quality standards"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all"
              >
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses already trading on our platform. Connect, enquire, and expand globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-blue-900 px-10 py-5 rounded-full font-black text-lg shadow-2xl hover:shadow-white/30 transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/category/all"
                className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-3"
              >
                Explore Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}