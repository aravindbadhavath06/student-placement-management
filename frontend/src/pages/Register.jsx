
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserRoundPlus,
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Hash,
  Phone,
  Building2,
  CalendarDays,
  ArrowLeft,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import api from '../services/api'

export default function Register() {
  const navigate = useNavigate()

  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    phone: '',
    year: '',
    cgpa: '',
    departmentId: '',
  })

  useEffect(() => {
    let active = true

    async function loadDepartments() {
      try {
        const response = await api.get('/departments')

        if (active) {
          setDepartments(
            Array.isArray(response.data) ? response.data : [],
          )
        }
      } catch (err) {
        if (active) {
          setError(
            'Unable to load departments. Make sure the backend is running.',
          )
        }
      } finally {
        if (active) setLoadingDepartments(false)
      }
    }

    loadDepartments()

    return () => {
      active = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError('')
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const name = form.name.trim()
    const email = form.email.trim()
    const rollNumber = form.rollNumber.trim()

    if (
      !name ||
      !email ||
      !form.password ||
      !rollNumber ||
      !form.departmentId
    ) {
      setError('Please complete all required fields.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (
      form.phone &&
      !/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())
    ) {
      setError('Please enter a valid phone number.')
      return
    }

    let cgpa

    if (form.cgpa.trim() !== '') {
      cgpa = Number(form.cgpa)

      if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
        setError('CGPA must be between 0 and 10.')
        return
      }
    }

    const payload = {
      name,
      email,
      password: form.password,
      rollNumber,
      phone: form.phone.trim() || null,
      year: form.year || null,
      cgpa: cgpa ?? null,
      departmentId: Number(form.departmentId),
    }

    setSubmitting(true)

    try {
      await api.post('/auth/register', payload)

      setSuccess(
        'Account created successfully! You can now sign in.',
      )

      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rollNumber: '',
        phone: '',
        year: '',
        cgpa: '',
        departmentId: '',
      })

      setTimeout(() => {
        navigate('/login', {
          state: { registered: true },
          replace: true,
        })
      }, 1200)
    } catch (err) {
      const status = err.response?.status
      const data = err.response?.data

      if (status === 409) {
        setError(
          data?.message ||
            data?.error ||
            'Email or roll number already exists.',
        )
      } else {
        setError(
          data?.message ||
            data?.error ||
            'Registration failed. Check your details and try again.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'

  const labelClass =
    'mb-1.5 block text-sm font-medium text-slate-700'

  const iconClass =
    'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>

        <div className="grid overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-10 text-white lg:flex">
            <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-white/10" />

            <div className="relative">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <GraduationCap size={30} />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
                PlacePro
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight">
                Start your
                <br />
                career journey.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-indigo-100">
                Create your student account to connect with placement
                opportunities and manage your career profile.
              </p>
            </div>

            <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="font-semibold">One account, one profile</p>
                  <p className="mt-1 text-sm leading-6 text-indigo-100">
                    Your student profile will be created along with your
                    account.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="p-6 sm:p-9 lg:p-10">
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 lg:hidden">
                <GraduationCap size={26} />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <UserRoundPlus size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Create Account
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Register as a student to get started.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3.5 text-sm text-green-700"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <section>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Account Details
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="name">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserRoundPlus className={iconClass} />
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="email">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className={iconClass} />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="you@example.com"
                        autoComplete="email"
                        maxLength={254}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="password">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className={iconClass} />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        className={`${inputClass} pl-10 pr-11`}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="confirmPassword">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className={iconClass} />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className={`${inputClass} pl-10 pr-11`}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label={
                          showConfirmPassword
                            ? 'Hide confirm password'
                            : 'Show confirm password'
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Student Details
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="rollNumber">
                      Roll Number *
                    </label>
                    <div className="relative">
                      <Hash className={iconClass} />
                      <input
                        id="rollNumber"
                        name="rollNumber"
                        value={form.rollNumber}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="e.g. AI20261002"
                        maxLength={50}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="phone">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className={iconClass} />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="Enter phone number"
                        autoComplete="tel"
                        maxLength={20}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="departmentId">
                      Department *
                    </label>
                    <div className="relative">
                      <Building2 className={iconClass} />
                      <select
                        id="departmentId"
                        name="departmentId"
                        value={form.departmentId}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        required
                        disabled={loadingDepartments || departments.length === 0}
                      >
                        <option value="">
                          {loadingDepartments
                            ? 'Loading departments...'
                            : departments.length === 0
                              ? 'No departments available'
                              : 'Select department'}
                        </option>

                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="year">
                      Academic Year
                    </label>
                    <div className="relative">
                      <CalendarDays className={iconClass} />
                      <select
                        id="year"
                        name="year"
                        value={form.year}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                      >
                        <option value="">Select year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="cgpa">
                      CGPA <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      id="cgpa"
                      name="cgpa"
                      type="number"
                      value={form.cgpa}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. 8.5"
                      min="0"
                      max="10"
                      step="0.01"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      Enter a value between 0 and 10, or leave it blank.
                    </p>
                  </div>
                </div>
              </section>

              <button
                type="submit"
                disabled={submitting || loadingDepartments || departments.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserRoundPlus size={19} />
                    Create Student Account
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              By registering, you create a student account in PlacePro.
            </p>
          </main>
        </div>
      </div>
    </div>
  )
}
