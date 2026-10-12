
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  Users,
  Building2,
  BriefcaseBusiness,
  FileCheck2,
  Trophy,
  Headphones,
  ChevronRight,
  UserRound,
} from 'lucide-react'

const officerNavigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Students', icon: Users },
  { label: 'Companies', icon: Building2 },
  { label: 'Jobs & Internships', icon: BriefcaseBusiness },
  { label: 'Applications', icon: FileCheck2 },
  { label: 'Placements', icon: Trophy },
]

const studentNavigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My Profile', icon: UserRound },
  { label: 'Companies', icon: Building2 },
  { label: 'Jobs & Internships', icon: BriefcaseBusiness },
  { label: 'My Applications', icon: FileCheck2 },
  { label: 'Placements', icon: Trophy },
]

export default function Sidebar({ activePage, onNavigate }) {
  let currentUser = null

  try {
    currentUser = JSON.parse(
      sessionStorage.getItem('currentUser') || 'null',
    )
  } catch {
    currentUser = null
  }

  const role = currentUser?.role?.toUpperCase()
  const isStudent = role === 'STUDENT'

  const navigation = isStudent
    ? studentNavigation
    : officerNavigation

  const displayName = currentUser?.name || 'Portal User'
  const displayRole = role
    ? role.charAt(0) + role.slice(1).toLowerCase()
    : 'User'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-slate-200 bg-white px-4 py-6"
    >
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-700 text-sm font-black text-white shadow-lg shadow-violet-500/25">
          SP
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            PlacePro
          </h2>
          <p className="text-xs text-slate-400">
            Placement Portal
          </p>
        </div>
      </div>

      <p className="mb-3 mt-10 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-400">
        WORKSPACE
      </p>

      <nav className="flex flex-col gap-1.5">
        {navigation.map(({ label, icon: Icon }, index) => {
          const active = activePage === label

          return (
            <motion.button
              key={label}
              type="button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(label)}
              className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-colors ${
                active
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="active-navigation"
                  className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-violet-600"
                />
              )}

              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.8}
              />

              <span className="flex-1">{label}</span>

              {active && <ChevronRight size={15} />}
            </motion.button>
          )
        })}
      </nav>

      <div className="mt-auto">
        <div className="mb-5 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
          <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-white text-violet-600 shadow-sm">
            <Headphones size={19} />
          </div>

          <p className="text-sm font-semibold text-slate-800">
            Need assistance?
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Contact your placement team for support.
          </p>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {initials || 'U'}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {displayName}
            </p>

            <p className="text-xs text-slate-400">
              {displayRole}
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
