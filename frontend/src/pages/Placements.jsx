import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Trophy, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import api from '../services/api'

const emptyForm = {
  studentId: '',
  companyId: '',
  jobId: '',
  packageAmount: '',
  placedAt: '',
  status: 'PLACED',
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100'

const statusClass = {
  PLACED: 'bg-blue-50 text-blue-700',
  JOINED: 'bg-emerald-50 text-emerald-700',
  WITHDRAWN: 'bg-amber-50 text-amber-700',
}

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('currentUser') || 'null')
  } catch {
    return null
  }
}

function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') return [data]
  return []
}

export default function Placements() {
  const currentUser = getCurrentUser()
  const role = currentUser?.role?.toUpperCase()
  const isStudent = role === 'STUDENT'
  const canManagePlacements = role === 'ADMIN' || role === 'OFFICER'

  const [placements, setPlacements] = useState([])
  const [students, setStudents] = useState([])
  const [companies, setCompanies] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')
    setMessage('')

    try {
      let placementData = []
      let studentData = []
      let companyData = []
      let jobData = []

      if (isStudent) {
        if (!currentUser?.id) {
          throw new Error(
            'Your account details are missing. Please log out and log in again.',
          )
        }

        // Step 1: Load the signed-in student's profile.
        const studentResponse = await api.get(
          `/students/user/${currentUser.id}`,
        )

        const studentProfile = studentResponse.data

        if (!studentProfile?.id) {
          throw new Error(
            'Your student profile was not found. Please contact the placement team.',
          )
        }

        studentData = [studentProfile]

        // Step 2: Load only this student's placement records.
        // A 404 here may mean that no placement record exists yet.
        try {
          const placementResponse = await api.get(
            `/placements/student/${studentProfile.id}`,
          )

          placementData = normalizeList(placementResponse.data)
        } catch (placementError) {
          if (placementError.response?.status === 404) {
            placementData = []
          } else {
            throw placementError
          }
        }

        // Step 3: Load companies and jobs for display.
        // These are separate from the student's placement record.
        const [companyResult, jobResult] = await Promise.allSettled([
          api.get('/companies'),
          api.get('/jobs'),
        ])

        if (companyResult.status === 'fulfilled') {
          companyData = normalizeList(companyResult.value.data)
        }

        if (jobResult.status === 'fulfilled') {
          jobData = normalizeList(jobResult.value.data)
        }

        if (
          companyResult.status === 'rejected' ||
          jobResult.status === 'rejected'
        ) {
          setMessage(
            'Your profile and placement records loaded, but some company or job information is unavailable.',
          )
        }
      } else if (canManagePlacements) {
        // Admins and Officers can view all placement records.
        const [
          placementResponse,
          studentResponse,
          companyResponse,
          jobResponse,
        ] = await Promise.all([
          api.get('/placements'),
          api.get('/students'),
          api.get('/companies'),
          api.get('/jobs'),
        ])

        placementData = normalizeList(placementResponse.data)
        studentData = normalizeList(studentResponse.data)
        companyData = normalizeList(companyResponse.data)
        jobData = normalizeList(jobResponse.data)
      } else {
        throw new Error(
          'Your account role is not authorized for this page.',
        )
      }

      setPlacements(placementData)
      setStudents(studentData)
      setCompanies(companyData)
      setJobs(jobData)
    } catch (err) {
      const status = err.response?.status

      setError(
        err.message && !err.response
          ? err.message
          : status === 401
            ? 'Your session has expired. Please log in again.'
            : status === 403
              ? 'You do not have permission to access these placement records.'
              : status === 404
                ? 'Your student profile was not found. Please contact the placement team.'
                : typeof err.response?.data === 'string'
                  ? err.response.data
                  : err.response?.data?.error ||
                    'Unable to load placement records. Please refresh and try again.',
      )

      setPlacements([])
      setStudents([])
      setCompanies([])
      setJobs([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [isStudent, canManagePlacements, currentUser?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const studentById = useMemo(
    () =>
      new Map(
        students.map((student) => [String(student.id), student]),
      ),
    [students],
  )

  const companyById = useMemo(
    () =>
      new Map(
        companies.map((company) => [String(company.id), company]),
      ),
    [companies],
  )

  const jobById = useMemo(
    () =>
      new Map(
        jobs.map((job) => [String(job.id), job]),
      ),
    [jobs],
  )

  const filteredPlacements = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return placements

    return placements.filter((placement) => {
      const student = studentById.get(String(placement.studentId))
      const company = companyById.get(String(placement.companyId))
      const job = jobById.get(String(placement.jobId))

      return [
        placement.id,
        placement.studentId,
        placement.companyId,
        placement.jobId,
        placement.status,
        placement.placedAt,
        placement.packageAmount,
        student?.rollNumber,
        company?.name,
        job?.title,
      ]
        .filter((value) => value !== null && value !== undefined)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        )
    })
  }, [placements, search, studentById, companyById, jobById])

  const handleCreate = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!canManagePlacements) return

    if (
      !form.studentId ||
      !form.companyId ||
      !form.jobId ||
      !form.status
    ) {
      setError('Student, company, job, and status are required.')
      return
    }

    setSaving(true)

    try {
      await api.post('/placements', {
        studentId: Number(form.studentId),
        companyId: Number(form.companyId),
        jobId: Number(form.jobId),
        packageAmount:
          form.packageAmount === ''
            ? null
            : Number(form.packageAmount),
        placedAt: form.placedAt || null,
        status: form.status,
      })

      setForm(emptyForm)
      setShowForm(false)
      setMessage('Placement record created successfully.')

      await loadData(true)
    } catch (err) {
      setError(
        err.response?.status === 403
          ? 'You do not have permission to create placements.'
          : err.response?.status === 409
            ? 'This student already has a placement record.'
            : 'Could not create placement. Verify the selected student, company, and job.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (placement) => {
    if (!canManagePlacements) return

    if (!window.confirm(`Delete placement #${placement.id}?`)) {
      return
    }

    setError('')
    setMessage('')
    setDeletingId(placement.id)

    try {
      await api.delete(`/placements/${placement.id}`)

      setPlacements((previous) =>
        previous.filter((item) => item.id !== placement.id),
      )

      setMessage(
        `Placement #${placement.id} deleted successfully.`,
      )
    } catch (err) {
      setError(
        err.response?.status === 403
          ? 'Only an authorized administrator can delete placements.'
          : 'Could not delete the placement.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600">
            <Trophy size={18} />
            Placement outcomes
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Placements
          </h1>

          <p className="mt-2 text-slate-500">
            {isStudent
              ? 'View your personal placement outcomes.'
              : 'Review placement outcomes and recruitment records.'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          {canManagePlacements && (
            <button
              type="button"
              onClick={() => {
                setShowForm((value) => !value)
                setError('')
                setMessage('')
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
            >
              <Plus size={18} />
              {showForm ? 'Cancel' : 'Add placement'}
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Success or information message */}
      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {message}
        </div>
      )}

      {/* Add placement form: Admin and Officer only */}
      {showForm && canManagePlacements && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900">
            Create placement record
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Student *
              <select
                className={inputClass}
                value={form.studentId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    studentId: event.target.value,
                  })
                }
                required
              >
                <option value="">Select student</option>

                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    ID {student.id} · {student.rollNumber || 'Student'}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Company *
              <select
                className={inputClass}
                value={form.companyId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    companyId: event.target.value,
                    jobId: '',
                  })
                }
                required
              >
                <option value="">Select company</option>

                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} (ID {company.id})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Job *
              <select
                className={inputClass}
                value={form.jobId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    jobId: event.target.value,
                  })
                }
                required
              >
                <option value="">Select job</option>

                {jobs
                  .filter(
                    (job) =>
                      !form.companyId ||
                      String(
                        job.company?.id ?? job.companyId,
                      ) === String(form.companyId),
                  )
                  .map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} (ID {job.id})
                    </option>
                  ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Package amount (LPA)
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={form.packageAmount}
                onChange={(event) =>
                  setForm({
                    ...form,
                    packageAmount: event.target.value,
                  })
                }
                placeholder="8.5"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Placement date
              <input
                className={inputClass}
                type="date"
                value={form.placedAt}
                onChange={(event) =>
                  setForm({
                    ...form,
                    placedAt: event.target.value,
                  })
                }
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Status *
              <select
                className={inputClass}
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value,
                  })
                }
                required
              >
                <option value="PLACED">PLACED</option>
                <option value="JOINED">JOINED</option>
                <option value="WITHDRAWN">WITHDRAWN</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={
              saving ||
              !students.length ||
              !companies.length ||
              !jobs.length
            }
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Create placement'}
          </button>

          <p className="text-xs text-slate-400">
            Each student can have only one placement record. The selected
            job must belong to the selected company.
          </p>
        </form>
      )}

      {/* Placement count and search */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            {isStudent ? 'Your placement records' : 'Placement records'}
          </p>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {loading ? '—' : placements.length}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            {isStudent
              ? 'Your records from the API'
              : 'Live count from the API'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="placements-search"
            className="mb-3 block text-sm font-semibold text-slate-800"
          >
            Search placements
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="placements-search"
              className={`${inputClass} pl-11`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                isStudent
                  ? 'Search your placement...'
                  : 'Search student, company, status...'
              }
            />
          </div>
        </div>
      </div>

      {/* Placement records table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-bold text-slate-900">
            Placement records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {isStudent
              ? 'Your placement information supplied by the Spring Boot API.'
              : 'Records supplied by your Spring Boot API.'}
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-14 text-center text-slate-500">
            Loading placements...
          </div>
        ) : filteredPlacements.length === 0 ? (
          <div className="px-6 py-14 text-center text-slate-500">
            {error
              ? 'Resolve the error above and refresh.'
              : isStudent
                ? 'No placement record is available for your account yet.'
                : 'No placement records found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Placement</th>
                  {!isStudent && (
                    <th className="px-4 py-4">Student</th>
                  )}
                  <th className="px-4 py-4">Company</th>
                  <th className="px-4 py-4">Job</th>
                  <th className="px-4 py-4">Package</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Status</th>
                  {canManagePlacements && (
                    <th className="px-4 py-4">Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredPlacements.map((placement) => {
                  const student = studentById.get(
                    String(placement.studentId),
                  )
                  const company = companyById.get(
                    String(placement.companyId),
                  )
                  const job = jobById.get(String(placement.jobId))

                  return (
                    <tr
                      key={placement.id}
                      className="border-t border-slate-100 hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        #{placement.id}
                      </td>

                      {!isStudent && (
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {student?.rollNumber ||
                            `Student #${placement.studentId}`}
                        </td>
                      )}

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {company?.name ||
                          `Company #${placement.companyId}`}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {job?.title || `Job #${placement.jobId}`}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {placement.packageAmount != null
                          ? `${placement.packageAmount} LPA`
                          : '—'}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {placement.placedAt || '—'}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            statusClass[placement.status] ||
                            'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {placement.status || 'UNKNOWN'}
                        </span>
                      </td>

                      {canManagePlacements && (
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleDelete(placement)}
                            disabled={deletingId === placement.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            {deletingId === placement.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="border-t border-slate-100 px-6 py-3 text-sm text-slate-400">
            Showing {filteredPlacements.length} of {placements.length}{' '}
            placements
          </div>
        )}
      </div>
    </motion.section>
  )
}