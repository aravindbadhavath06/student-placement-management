import { motion } from 'motion/react'

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'violet',
  delay = 0,
}) {
  const colors = {
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/40 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        {Icon && (
          <div className={`rounded-xl p-3 ${colors[color] ?? colors.violet}`}>
            <Icon size={21} strokeWidth={1.8} />
          </div>
        )}
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      {change && (
        <p className="mt-2 text-xs font-medium text-emerald-600">{change}</p>
      )}
    </motion.article>
  )
}