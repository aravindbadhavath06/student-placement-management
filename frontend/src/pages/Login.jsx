
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Button from '../components/ui/Button'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password) {
      toast.error('Enter your email and password.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      })

      const token = response.data?.token

      if (!token) {
        toast.error('The server did not return a login token.')
        return
      }

      sessionStorage.setItem('accessToken', token)

      try {
        const userResponse = await api.get('/users/me')
        const currentUser = userResponse.data

        if (!currentUser?.role || !currentUser?.id) {
          throw new Error(
            'Invalid user details returned by the server.'
          )
        }

        if (currentUser.status !== true) {
          throw new Error('Your account is inactive.')
        }

        sessionStorage.setItem(
          'currentUser',
          JSON.stringify(currentUser)
        )

        toast.success(`Welcome, ${currentUser.name}!`)
        navigate('/', { replace: true })
      } catch (error) {
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('currentUser')

        const status = error.response?.status

        const message =
          error.response?.data?.error ||
          (status === 401
            ? 'Your session could not be verified. Please log in again.'
            : status === 403
              ? 'You do not have permission to continue.'
              : 'Unable to retrieve your account details.')

        toast.error(
          error.message === 'Your account is inactive.'
            ? error.message
            : message
        )
      }
    } catch (error) {
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('currentUser')

      const status = error.response?.status

      const message =
        error.response?.data?.error ||
        (status === 401
          ? 'Invalid email or password.'
          : status === 403
            ? 'Your account is inactive.'
            : 'Unable to connect. Check that the backend is running.')

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] p-4 sm:p-8">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-slate-300/40 lg:grid-cols-2"
      >
        {/* Left branding panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 p-10 text-white lg:flex">
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-12 top-32 h-48 w-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-violet-400/20 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/10">
              <GraduationCap size={27} />
            </div>

            <div>
              <p className="text-lg font-bold">PlacePro</p>
              <p className="text-xs text-white/60">Placement Portal</p>
            </div>
          </div>

          <div className="relative my-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium">
              <Sparkles size={14} />
              Your future starts here
            </div>

            <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Turn your potential into your next opportunity.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-indigo-100/80">
              Discover career opportunities, manage applications, and take the
              next step in your professional journey.
            </p>

            <div className="mt-9 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-indigo-700 bg-amber-200 text-xs font-bold text-amber-900">
                  S
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-indigo-700 bg-emerald-200 text-xs font-bold text-emerald-900">
                  P
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-indigo-700 bg-sky-200 text-xs font-bold text-sky-900">
                  A
                </div>
              </div>

              <p className="text-xs leading-5 text-white/70">
                Your placement journey,
                <br />
                all in one place.
              </p>
            </div>
          </div>

          <p className="relative text-xs text-white/50">
            Student Placement Management System
          </p>
        </section>

        {/* Right sign-in panel */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
                <GraduationCap size={26} />
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                PlacePro
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Placement Portal
              </p>
            </div>

            <p className="text-sm font-semibold text-violet-600">
              WELCOME BACK
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your credentials to continue to your workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
                  <Mail size={18} className="shrink-0 text-slate-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="min-w-0 flex-1 py-3.5 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
                  <LockKeyhole
                    size={18}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="min-w-0 flex-1 py-3.5 text-sm outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full !py-3.5"
              >
                Sign in <ArrowRight size={17} />
              </Button>
            </form>

            {/* Student registration link */}
            <div className="mt-5 text-center">
              <p className="text-sm text-slate-500">
                New to PlacePro?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-1 font-semibold text-violet-600 transition hover:text-violet-800"
                >
                  <UserPlus size={15} />
                  Create Student Account
                </button>
              </p>
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p className="text-xs leading-5 text-slate-500">
                Your account access is protected by the placement system's
                authentication service.
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              PlacePro · Student Placement Management System
            </p>
          </div>
        </section>
      </motion.div>
    </main>
  )
}
