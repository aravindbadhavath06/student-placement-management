
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Bell,
  Search,
  ChevronDown,
  CalendarDays,
  UserRound,
  Mail,
  ShieldCheck,
  LogOut,
} from 'lucide-react'

export default function Topbar({ activePage }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  let currentUser = null

  try {
    currentUser = JSON.parse(
      sessionStorage.getItem('currentUser') || 'null',
    )
  } catch {
    currentUser = null
  }

  const name = currentUser?.name || 'Portal User'
  const email = currentUser?.email || 'Email unavailable'
  const role = currentUser?.role || 'USER'
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  function handleLogout() {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('currentUser')
    setProfileOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8"
    >
      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          Workspace <span className="mx-2 text-slate-300">/</span>
          <span className="font-medium text-slate-600">
            {activePage}
          </span>
        </p>
      </div>

      <div className="ml-4 flex items-center gap-3 sm:gap-5">
        <label className="hidden h-10 w-56 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-violet-400 md:flex">
          <Search size={16} className="text-slate-400" />
          <input
            type="search"
            placeholder="Search anything..."
            aria-label="Search"
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
            /
          </kbd>
        </label>

        <button
          type="button"
          aria-label="Academic calendar"
          className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 lg:flex"
        >
          <CalendarDays size={16} className="text-slate-400" />
          Academic Year 2026–27
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 text-xs font-bold text-white">
              {initials || 'U'}
            </span>
            <ChevronDown
              size={15}
              className={`hidden text-slate-400 transition-transform sm:block ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
              >
                <div className="border-b border-slate-100 bg-violet-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 text-sm font-bold text-white">
                      {initials || 'U'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="flex items-start gap-3">
                    <UserRound
                      size={17}
                      className="mt-0.5 text-violet-600"
                    />
                    <div>
                      <p className="text-xs text-slate-400">Full name</p>
                      <p className="text-sm font-medium text-slate-800">
                        {name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail
                      size={17}
                      className="mt-0.5 text-violet-600"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="break-all text-sm font-medium text-slate-800">
                        {email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={17}
                      className="mt-0.5 text-violet-600"
                    />
                    <div>
                      <p className="text-xs text-slate-400">Role</p>
                      <p className="text-sm font-medium capitalize text-slate-800">
                        {role.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}
