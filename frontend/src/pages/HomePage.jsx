import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Package, Users, Globe, TrendingUp } from 'lucide-react'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import { motion } from 'framer-motion'
import api from '../api'

//const categories = [
  //{ name: 'Ayurveda & Herbal', slug: 'ayurveda', icon: '🌿', },
  //{ name: 'Electronics', slug: 'electronics', icon: '💻',},
  //{ name: 'Agriculture', slug: 'agriculture', icon: '🌾', },
  //{ name: 'Home Accessories', slug: 'home-accessories', icon: '🏠',  },
  //{ name: 'Textiles & Garments', slug: 'textiles', icon: '👔', },
  //{ name: 'Machinery', slug: 'machinery', icon: '⚙️', },
  //{ name: 'Chemicals', slug: 'chemicals', icon: '🧪', },
  //{ name: 'Food Products', slug: 'food', icon: '🍎', }
//]




const stats = [
  { icon: Package, label: 'Products Listed', value: '' },
  { icon: Users, label: 'Active Suppliers', value: '' },
  { icon: Globe, label: 'Countries Served', value: '' },
  { icon: TrendingUp, label: 'Daily Enquiries', value: '' }
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
const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories")
      setCategories(res.data)
    } catch (err) {
      console.error("Failed to load categories", err)
    } finally {
      setLoading(false)
    }
  }

  fetchCategories()
}, [])

  return (
    <div className="min-h-screen">
     {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-500 text-white">
  
  {/* Glow blobs */}
  <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" />
  <div className="absolute bottom-0 -right-40 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />

  <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 text-center">
    
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
    >
      Powering <span className="text-secondary-light">Global Trade</span>  
      <br /> for Modern Businesses
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-6 text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto"
    >
      Discover verified suppliers, premium products & grow beyond borders.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
      className="mt-10 flex justify-center"
    >
      <Link
        to="/category/all"
        className="group flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-primary/40 transition-all"
      >
        Explore Marketplace
        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>

  </div>
</section>

          {/* STATS */}

<section className="relative -mt-16 z-20">
  <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
    {stats.map((stat, i) => (
      <motion.div
        key={i}
        whileHover={{ y: -8 }}
        className="backdrop-blur-xl bg-white/70 rounded-3xl p-6 shadow-xl border border-white/40 text-center"
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
          <stat.icon className="text-primary w-7 h-7" />
        </div>
        <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
        <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
      </motion.div>
    ))}
  </div>
</section>
    
    <section className="py-20 bg-surface">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div className="flex justify-between items-center mb-10">
      <h2 className="text-3xl font-bold text-slate-800">
        Browse by Category
      </h2>
      <Link
        to="/category/all"
        className="text-primary font-semibold hover:text-primary-dark transition"
      >
        View All →
      </Link>
    </div>

    <motion.div
      variants={gridVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-2 md:grid-cols-4 gap-6"
    >
      {categories.map((category) => (
        <motion.div
          key={category.slug}
          variants={cardVariants}
          whileHover={{
            scale: 1.06,
            y: -8,
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <CategoryCard category={category} />
        </motion.div>
      ))}
    </motion.div>

  </div>
</section>

    <section className="py-24 bg-gradient-to-br from-secondary-dark to-secondary-light text-white text-center">
  <motion.h2
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-3xl sm:text-4xl font-extrabold"
  >
    Bringing Global Products Within Your Reach Today
  </motion.h2>

  <p className="mt-4 text-secondary-100 max-w-xl mx-auto">
    Connect, Enquire, and Expand Your Reach Globally
  </p>

  <Link
    to="/signup"
    className="inline-block mt-8 bg-white text-secondary-dark px-10 py-4 rounded-2xl font-semibold shadow-xl hover:scale-105 transition-transform"
  >
    Register Now
  </Link>
</section>
    </div>
  )
}
