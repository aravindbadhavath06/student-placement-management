import { useCallback, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  GraduationCap,
} from 'lucide-react'
import api from '../services/api'

export default function Students() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStudents = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/students')

      if (!Array.isArray(response.data)) {
        throw new Error('Unexpected response format')
      }

      setStudents(response.data)
    } catch (err) {
      const status = err.response?.status

      setError(
        status === 401
          ? 'Your session is invalid. Please sign in again.'
          : status === 403
            ? 'Only Admin and Officer accounts can view all students.'
            : err.response
              ? `Unable to load students (HTTP ${status}).`
              : 'Cannot connect to the backend. Check that it is running.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const filteredStudents = students.filter((student) =>
    [
      student.id,
      student.rollNumber,
      student.phone,
      student.year,
      student.cgpa,
      student.departmentId,
      student.userId,
    ]
      .filter((value) => value != null)
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600">
            <GraduationCap size={18} />
            Student management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Students
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View student academic and placement information.
          </p>
        </div>

        <button
          onClick={loadStudents}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total students returned</p>
            <span className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Users size={20} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {loading ? '—' : students.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Live count from the API
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="student-search"
            className="text-sm font-semibold text-slate-700"
          >
            Search students
          </label>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
            <Search size={17} className="text-slate-400" />
            <input
              id="student-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search roll number, year..."
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load students</p>
            <p className="mt-1">{error}</p>
          </div>
          <button
            onClick={loadStudents}
            className="font-semibold underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">Student records</h2>
          <p className="mt-1 text-xs text-slate-500">
            Records supplied by your Spring Boot API.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Student ID</th>
                <th className="px-5 py-4">Roll number</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Year</th>
                <th className="px-5 py-4">CGPA</th>
                <th className="px-5 py-4">Department</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                !error &&
                filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                    className="border-t border-slate-100 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {student.id ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {student.rollNumber ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {student.phone ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {student.year ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {student.cgpa ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {student.departmentId ?? '—'}
                    </td>
                  </motion.tr>
                ))}

              {loading && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading student records...
                  </td>
                </tr>
              )}

              {!loading && !error && filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    {students.length === 0
                      ? 'No student records returned by the API.'
                      : 'No students match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          Showing {loading ? '—' : filteredStudents.length} records
        </div>
      </div>
    </motion.section>
  )
}