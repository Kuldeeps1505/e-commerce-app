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
        <img
        src={category.image}
        alt={category.name}
        className="w-full h-40 object-cover"
      />
          <h3 className="font-semibold text-lg text-slate-800 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
        
      </Link>
    </motion.div>
  )
}















