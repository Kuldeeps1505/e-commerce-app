import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function CategoryCard({ category }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/category/${category.slug}`}
        className="group relative block rounded-3xl p-[1px] bg-gradient-to-br from-primary/40 to-secondary/40 hover:scale-[1.03] transition-all"
      >
        <div className="rounded-3xl bg-white p-6 text-center shadow-lg group-hover:shadow-2xl transition-all">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
            {category.icon}
          </div>
          <h3 className="font-semibold text-lg text-slate-800 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  )
}















