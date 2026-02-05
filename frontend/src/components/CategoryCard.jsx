import { Link } from 'react-router-dom'


 

export default function CategoryCard({ category }) {
  

  return (
    <Link
      to={`/category/${category.slug}`}
      className="block bg-surface-elevated rounded-2xl p-6 text-center border border-surface-border shadow-soft hover:shadow-soft-lg hover:border-primary-200 hover:-translate-y-1 transition-all duration-200 group"
    >
      <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
      <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
 
    </Link>
  )
}
