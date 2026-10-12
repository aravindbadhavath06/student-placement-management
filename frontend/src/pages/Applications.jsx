
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { FileCheck2, RefreshCw, Search, Trash2 } from 'lucide-react';
import api from '../services/api';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100';

const statusClass = {
  APPLIED: 'bg-blue-50 text-blue-700',
  SHORTLISTED: 'bg-violet-50 text-violet-700',
  REJECTED: 'bg-red-50 text-red-700',
  SELECTED: 'bg-emerald-50 text-emerald-700',
};

const getCurrentUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  } catch {
    return null;
  }
};

export default function Applications() {
  const currentUser = getCurrentUser();
  const role = String(currentUser?.role || '').toUpperCase();
  const isStudent = role === 'STUDENT';
  const canDelete = role === 'ADMIN' || role === 'OFFICER';

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError('');
    setMessage('');

    try {
      const jobsRequest = api.get('/jobs');

      let applicationsRequest;

      if (isStudent) {
        if (!currentUser?.id) {
          throw new Error('Your login details could not be found. Please log in again.');
        }

        const profileResponse = await api.get(
          `/students/user/${currentUser.id}`
        );

        const studentId = profileResponse.data?.id;

        if (!studentId) {
          throw new Error(
            'Your student profile was not found. Please contact your placement officer.'
          );
        }

        applicationsRequest = api.get(
          `/applications/student/${studentId}`
        );
      } else {
        applicationsRequest = api.get('/applications');
      }

      const [applicationResponse, jobResponse] = await Promise.all([
        applicationsRequest,
        jobsRequest,
      ]);

      setApplications(
        Array.isArray(applicationResponse.data)
          ? applicationResponse.data
          : []
      );

      setJobs(Array.isArray(jobResponse.data) ? jobResponse.data : []);
    } catch (err) {
      setApplications([]);

      setError(
        err.message && !err.response
          ? err.message
          : err.response?.status === 401
            ? 'Your session has expired. Please log in again.'
            : err.response?.status === 403
              ? 'You do not have permission to view these applications.'
              : err.response?.status === 404
                ? 'Your student profile or application records could not be found.'
                : typeof err.response?.data === 'string'
                  ? err.response.data
                  : 'Unable to load applications. Check that the backend is running.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.id, isStudent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const jobById = useMemo(
    () => new Map(jobs.map((job) => [String(job.id), job])),
    [jobs]
  );

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return applications;

    return applications.filter((application) => {
      const job = jobById.get(String(application.jobId));

      return [
        application.id,
        application.studentId,
        application.jobId,
        application.status,
        application.appliedAt,
        job?.title,
        job?.company?.name,
      ]
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [applications, search, jobById]);

  const handleDelete = async (application) => {
    if (!canDelete) return;

    if (!window.confirm(`Delete application #${application.id}?`)) {
      return;
    }

    setError('');
    setMessage('');
    setDeletingId(application.id);

    try {
      await api.delete(`/applications/${application.id}`);

      setApplications((previous) =>
        previous.filter((item) => item.id !== application.id)
      );

      setMessage(`Application #${application.id} deleted successfully.`);
    } catch (err) {
      setError(
        err.response?.status === 403
          ? 'You do not have permission to delete applications.'
          : err.response?.status === 404
            ? 'Application not found. Refresh the list.'
            : 'Could not delete the application.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600">
            <FileCheck2 size={18} />
            {isStudent ? 'Your application tracking' : 'Application tracking'}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isStudent ? 'My Applications' : 'Applications'}
          </h1>

          <p className="mt-2 text-slate-500">
            {isStudent
              ? 'Track the status of the jobs and internships you applied for.'
              : 'Review candidates and monitor recruitment progress.'}
          </p>
        </div>

        <button
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
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            {isStudent ? 'Your applications' : 'Total applications'}
          </p>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {loading ? '—' : applications.length}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            {isStudent
              ? 'Applications submitted using your account'
              : 'Live count from the API'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="application-search"
            className="mb-3 block text-sm font-semibold text-slate-800"
          >
            Search applications
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="application-search"
              className={`${inputClass} pl-11`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                isStudent
                  ? 'Search job, company, status...'
                  : 'Search student ID, job, status...'
              }
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-bold text-slate-900">
            {isStudent ? 'Your application history' : 'Application records'}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {isStudent
              ? 'Check the latest status of each application.'
              : 'Records supplied by your Spring Boot API.'}
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-14 text-center text-slate-500">
            Loading applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <FileCheck2
              size={32}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="font-semibold text-slate-700">
              {error
                ? 'Applications could not be loaded.'
                : search
                  ? 'No matching applications found.'
                  : isStudent
                    ? 'You have not applied for any jobs yet.'
                    : 'No applications found.'}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {error
                ? 'Resolve the error above and refresh.'
                : search
                  ? 'Try a different search term.'
                  : isStudent
                    ? 'Visit Jobs & Internships to explore available opportunities.'
                    : 'Applications will appear here when candidates apply.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Application</th>

                  {!isStudent && (
                    <th className="px-4 py-4">Student ID</th>
                  )}

                  <th className="px-4 py-4">Job</th>
                  <th className="px-4 py-4">Applied at</th>
                  <th className="px-4 py-4">Status</th>

                  {canDelete && (
                    <th className="px-4 py-4">Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((application) => {
                  const job = jobById.get(String(application.jobId));

                  return (
                    <tr
                      key={application.id}
                      className="border-t border-slate-100 hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        #{application.id}
                      </td>

                      {!isStudent && (
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {application.studentId ?? '—'}
                        </td>
                      )}

                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {job?.title || `Job #${application.jobId ?? '—'}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {job?.company?.name || ''}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {application.appliedAt
                          ? new Date(application.appliedAt).toLocaleString()
                          : '—'}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                            statusClass[application.status] ||
                            'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {application.status || 'UNKNOWN'}
                        </span>
                      </td>

                      {canDelete && (
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDelete(application)}
                            disabled={deletingId === application.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            {deletingId === application.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="border-t border-slate-100 px-6 py-3 text-sm text-slate-400">
            Showing {filteredApplications.length} of {applications.length}{' '}
            applications
          </div>
        )}
      </div>
    </motion.section>
  );
}
