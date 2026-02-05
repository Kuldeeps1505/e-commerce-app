import { Link } from 'react-router-dom'
import { ArrowRight, Package, Users, Globe, TrendingUp } from 'lucide-react'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'

const categories = [
  { name: 'Ayurveda & Herbal', slug: 'ayurveda', icon: '🌿', },
  { name: 'Electronics', slug: 'electronics', icon: '💻',},
  { name: 'Agriculture', slug: 'agriculture', icon: '🌾', },
  { name: 'Home Accessories', slug: 'home-accessories', icon: '🏠',  },
  { name: 'Textiles & Garments', slug: 'textiles', icon: '👔', },
  { name: 'Machinery', slug: 'machinery', icon: '⚙️', },
  { name: 'Chemicals', slug: 'chemicals', icon: '🧪', },
  { name: 'Food Products', slug: 'food', icon: '🍎', }
]




const stats = [
  { icon: Package, label: 'Products Listed', value: '' },
  { icon: Users, label: 'Active Suppliers', value: '' },
  { icon: Globe, label: 'Countries Served', value: '' },
  { icon: TrendingUp, label: 'Daily Enquiries', value: '' }
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-500 text-white py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-sm">
            Connect with Global Suppliers & Buyers
          </h1>
          <p className="text-lg sm:text-xl mb-10 text-primary-100 max-w-2xl mx-auto">
            India's Leading B2B Marketplace for Import & Export
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/category/all" className="inline-flex items-center justify-center bg-white text-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-50 hover:text-primary-dark transition-all shadow-soft-lg">
              Explore Products
            </Link>
           
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-surface-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-surface-elevated rounded-2xl shadow-soft border border-surface-border hover:shadow-soft-lg hover:border-primary-200 transition-all">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary-100 flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Browse by Category</h2>
            <Link to="/category/all" className="text-primary font-semibold hover:text-primary-dark flex items-center gap-1 transition-colors">
              View All <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map(category => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gradient-to-br from-secondary-dark via-secondary to-secondary-light text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-lg text-secondary-100 mb-8 max-w-xl mx-auto opacity-95">
            Join thousands of suppliers reaching buyers worldwide
          </p>
          <Link to="/become-supplier" className="inline-block bg-white text-secondary-dark px-8 py-3.5 rounded-xl font-semibold hover:bg-secondary-50 hover:text-secondary-dark transition-all shadow-soft-lg">
            Register as Supplier
          </Link>
        </div>
      </section>
    </div>
  )
}
