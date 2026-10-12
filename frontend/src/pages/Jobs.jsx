
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  BriefcaseBusiness,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  MapPin,
  CalendarDays,
  CheckCircle2,
  Send,
  Building2,
} from 'lucide-react';
import api from '../services/api';

const emptyForm = {
  title: '',
  description: '',
  packageAmount: '',
  location: '',
  minimumCgpa: '',
  deadline: '',
  companyId: '',
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100';

const getCurrentUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  } catch {
    return null;
  }
};

const getRole = (user) => {
  const role = user?.role || user?.userRole || user?.roles?.[0] || '';
  return String(typeof role === 'object' ? role.name || role.authority : role)
    .replace(/^ROLE_/, '')
    .toUpperCase();
};

const getErrorMessage = (err, fallback) => {
  const data = err.response?.data;

  if (typeof data === 'string' && data.trim()) return data;
  if (data?.message) return data.message;
  if (err.response?.status === 401) {
    return 'Your session has expired. Please log in again.';
  }
  if (err.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  return fallback;
};

const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;

  // A date-only deadline remains valid through the end of that day.
  const deadlineDate = new Date(`${deadline}T23:59:59`);
  return !Number.isNaN(deadlineDate.getTime()) &&
    deadlineDate.getTime() < Date.now();
};

export default function Jobs() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const role = getRole(currentUser);
  const isStudent = role === 'STUDENT';
  const canManageJobs = role === 'ADMIN' || role === 'OFFICER';

  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [applicationDataError, setApplicationDataError] = useState('');

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');
    setApplicationDataError('');

    try {
      const jobsRequest = api.get('/jobs');
      const companiesRequest = api.get('/companies');

      const [jobsResult, companiesResult] = await Promise.allSettled([
        jobsRequest,
        companiesRequest,
      ]);

      if (jobsResult.status === 'rejected') {
        throw jobsResult.reason;
      }

      setJobs(
        Array.isArray(jobsResult.value.data) ? jobsResult.value.data : []
      );

      if (companiesResult.status === 'fulfilled') {
        setCompanies(
          Array.isArray(companiesResult.value.data)
            ? companiesResult.value.data
            : []
        );
      } else {
        setCompanies([]);
      }

      if (isStudent) {
        if (!currentUser?.id) {
          setApplicationDataError(
            'Your login information is missing. Please log in again.'
          );
          setStudentProfile(null);
          setAppliedJobIds([]);
          return;
        }

        try {
          const profileResponse = await api.get(
            `/students/user/${currentUser.id}`
          );

          const profile = profileResponse.data;
          setStudentProfile(profile);

          if (!profile?.id) {
            throw new Error('Student profile ID was not returned.');
          }

          const applicationsResponse = await api.get(
            `/applications/student/${profile.id}`
          );

          const applications = Array.isArray(applicationsResponse.data)
            ? applicationsResponse.data
            : [];

          const appliedIds = applications
            .map((application) => {
              const jobId =
                application.jobId ??
                application.job?.id ??
                application.job?.jobId;

              return jobId == null ? null : String(jobId);
            })
            .filter((id) => id !== null);

          setAppliedJobIds(appliedIds);
        } catch (err) {
          setStudentProfile(null);
          setAppliedJobIds([]);
          setApplicationDataError(
            getErrorMessage(
              err,
              'Unable to load your student profile or applications.'
            )
          );
        }
      } else {
        setStudentProfile(null);
        setAppliedJobIds([]);
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Unable to load jobs. Check that your backend is running.'
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser, isStudent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return jobs;

    return jobs.filter((job) =>
      [
        job.title,
        job.description,
        job.location,
        job.company?.name,
        job.packageAmount,
      ]
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [jobs, search]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.title.trim() || !form.companyId) {
      setError('Job title and company are required.');
      return;
    }

    if (
      form.minimumCgpa !== '' &&
      (Number(form.minimumCgpa) < 0 || Number(form.minimumCgpa) > 10)
    ) {
      setError('Minimum CGPA must be between 0 and 10.');
      return;
    }

    setSaving(true);

    try {
      await api.post('/jobs', {
        title: form.title.trim(),
        description: form.description.trim(),
        packageAmount:
          form.packageAmount === '' ? null : Number(form.packageAmount),
        location: form.location.trim(),
        minimumCgpa:
          form.minimumCgpa === '' ? null : Number(form.minimumCgpa),
        deadline: form.deadline || null,
        companyId: Number(form.companyId),
      });

      setForm(emptyForm);
      setShowForm(false);
      setMessage('Job created successfully.');
      await loadData(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Could not create the job. Check your permissions and fields.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.title}"?`)) return;

    setError('');
    setMessage('');
    setDeletingId(job.id);

    try {
      await api.delete(`/jobs/${job.id}`);

      setJobs((previous) =>
        previous.filter((item) => String(item.id) !== String(job.id))
      );

      setMessage('Job deleted successfully.');
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          err.response?.status === 404
            ? 'Job not found. Refresh the list.'
            : 'Could not delete the job.'
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleApply = async (job) => {
    setError('');
    setMessage('');

    if (!isStudent) {
      setError('Only student accounts can apply for jobs.');
      return;
    }

    if (!studentProfile?.id) {
      setError(
        applicationDataError ||
          'Your student profile could not be loaded. Please refresh the page.'
      );
      return;
    }

    if (appliedJobIds.includes(String(job.id))) {
      setMessage('You have already applied for this opportunity.');
      return;
    }

    if (isDeadlinePassed(job.deadline)) {
      setError('The application deadline for this job has passed.');
      return;
    }

    const minimumCgpa = job.minimumCgpa;
    const studentCgpa = studentProfile.cgpa;

    if (
      minimumCgpa !== null &&
      minimumCgpa !== undefined &&
      minimumCgpa !== '' &&
      (studentCgpa === null ||
        studentCgpa === undefined ||
        studentCgpa === '' ||
        Number(studentCgpa) < Number(minimumCgpa))
    ) {
      setError(
        `Your CGPA does not meet this job's minimum requirement of ${minimumCgpa}.`
      );
      return;
    }

    setApplyingId(job.id);

    try {
      // The backend identifies the student from the authenticated token.
      await api.post('/applications', {
        jobId: job.id,
      });

      setAppliedJobIds((previous) =>
        previous.includes(String(job.id))
          ? previous
          : [...previous, String(job.id)]
      );

      setMessage(`Successfully applied for ${job.title || 'this job'}!`);
    } catch (err) {
      const status = err.response?.status;
      const responseMessage =
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message;

      if (
        status === 409 ||
        /already applied|duplicate/i.test(responseMessage || '')
      ) {
        setAppliedJobIds((previous) =>
          previous.includes(String(job.id))
            ? previous
            : [...previous, String(job.id)]
        );
        setError('You have already applied for this opportunity.');
      } else {
        setError(
          getErrorMessage(
            err,
            'Could not submit your application. Please try again.'
          )
        );
      }
    } finally {
      setApplyingId(null);
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
            <BriefcaseBusiness size={18} />
            {isStudent ? 'Career opportunities' : 'Recruitment management'}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Jobs &amp; Internships
          </h1>

          <p className="mt-2 text-slate-500">
            {isStudent
              ? 'Explore opportunities, check your eligibility, and apply.'
              : 'Explore openings and manage recruitment opportunities.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
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

          {canManageJobs && (
            <button
              type="button"
              onClick={() => {
                setShowForm((value) => !value);
                setError('');
                setMessage('');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
            >
              <Plus size={18} />
              {showForm ? 'Cancel' : 'Add job'}
            </button>
          )}
        </div>
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

      {isStudent && applicationDataError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {applicationDataError} Applying is disabled until your profile and
          application history can be loaded.
        </div>
      )}

      {showForm && canManageJobs && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900">
            Create job opportunity
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Job title *
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="Software Engineer"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Company *
              <select
                className={inputClass}
                value={form.companyId}
                onChange={(e) =>
                  setForm({ ...form, companyId: e.target.value })
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
              Package amount (LPA)
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={form.packageAmount}
                onChange={(e) =>
                  setForm({ ...form, packageAmount: e.target.value })
                }
                placeholder="8.5"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Location
              <input
                className={inputClass}
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                placeholder="Hyderabad"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Minimum CGPA
              <input
                className={inputClass}
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={form.minimumCgpa}
                onChange={(e) =>
                  setForm({ ...form, minimumCgpa: e.target.value })
                }
                placeholder="7.0"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Application deadline
              <input
                className={inputClass}
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm({ ...form, deadline: e.target.value })
                }
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              Description
              <textarea
                className={inputClass}
                rows="3"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the role and responsibilities"
              />
            </label>
          </div>

          {companies.length === 0 && (
            <p className="text-sm text-amber-700">
              No companies are available. Add a company before creating a job.
            </p>
          )}

          <button
            type="submit"
            disabled={saving || companies.length === 0}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Create job'}
          </button>
        </form>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total opportunities</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {loading ? '—' : jobs.length}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Live count from the API
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="jobs-search"
            className="mb-3 block text-sm font-semibold text-slate-800"
          >
            Search opportunities
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="jobs-search"
              className={`${inputClass} pl-11`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, company, location..."
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-bold text-slate-900">
            {isStudent ? 'Available opportunities' : 'Opportunity directory'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isStudent
              ? 'Review the requirements before submitting your application.'
              : 'Records supplied by your Spring Boot API.'}
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-14 text-center text-slate-500">
            Loading jobs...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="px-6 py-14 text-center text-slate-500">
            {error
              ? 'Resolve the error above and refresh.'
              : jobs.length === 0
                ? 'No job opportunities have been posted yet.'
                : 'No matching jobs found. Try another search.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredJobs.map((job) => {
              const alreadyApplied = appliedJobIds.includes(String(job.id));
              const deadlinePassed = isDeadlinePassed(job.deadline);

              const minimumCgpa =
                job.minimumCgpa === null ||
                job.minimumCgpa === undefined ||
                job.minimumCgpa === ''
                  ? null
                  : Number(job.minimumCgpa);

              const studentCgpa =
                studentProfile?.cgpa === null ||
                studentProfile?.cgpa === undefined ||
                studentProfile?.cgpa === ''
                  ? null
                  : Number(studentProfile.cgpa);

              const cgpaIneligible =
                isStudent &&
                minimumCgpa !== null &&
                studentCgpa !== null &&
                studentCgpa < minimumCgpa;

              const eligibilityUnknown =
                isStudent &&
                minimumCgpa !== null &&
                studentCgpa === null;

              return (
                <article
                  key={job.id}
                  className="flex flex-col justify-between gap-5 px-6 py-5 hover:bg-slate-50 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                      <BriefcaseBusiness size={22} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">
                        {job.title || 'Untitled job'}
                      </h3>

                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <Building2 size={15} />
                        {job.company?.name ||
                          `Company ID: ${job.company?.id ?? '—'}`}
                      </p>

                      {job.description && (
                        <p className="mt-2 whitespace-pre-line break-words text-sm text-slate-500">
                          {job.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={15} />
                            {job.location}
                          </span>
                        )}

                        {job.deadline && (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              deadlinePassed ? 'text-red-600' : ''
                            }`}
                          >
                            <CalendarDays size={15} />
                            Deadline: {job.deadline}
                            {deadlinePassed ? ' (Closed)' : ''}
                          </span>
                        )}

                        {minimumCgpa !== null && (
                          <span>Minimum CGPA: {job.minimumCgpa}</span>
                        )}
                      </div>

                      {isStudent && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {alreadyApplied && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
                              Already applied
                            </span>
                          )}

                          {cgpaIneligible && (
                            <span className="rounded-full bg-amber-50 px-3 py-1.5 font-medium text-amber-800">
                              CGPA requirement not met
                            </span>
                          )}

                          {eligibilityUnknown && (
                            <span className="rounded-full bg-amber-50 px-3 py-1.5 font-medium text-amber-800">
                              CGPA could not be verified
                            </span>
                          )}
                        </div>
                      )}

                      {!isStudent && (
                        <p className="mt-2 text-xs text-slate-400">
                          Job ID: {job.id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3 self-start sm:self-center">
                    <span className="whitespace-nowrap rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                      {job.packageAmount != null
                        ? `${job.packageAmount} LPA`
                        : 'Package not specified'}
                    </span>

                    {isStudent && (
                      <button
                        type="button"
                        onClick={() => handleApply(job)}
                        disabled={
                          applyingId === job.id ||
                          alreadyApplied ||
                          deadlinePassed ||
                          cgpaIneligible ||
                          eligibilityUnknown ||
                          !studentProfile?.id ||
                          Boolean(applicationDataError)
                        }
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          alreadyApplied
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                      >
                        {alreadyApplied ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Send size={16} />
                        )}
                        {applyingId === job.id
                          ? 'Applying...'
                          : alreadyApplied
                            ? 'Applied'
                            : deadlinePassed
                              ? 'Deadline passed'
                              : cgpaIneligible
                                ? 'Not eligible'
                                : eligibilityUnknown
                                  ? 'Check profile'
                                  : 'Apply Now'}
                      </button>
                    )}

                    {canManageJobs && (
                      <button
                        type="button"
                        onClick={() => handleDelete(job)}
                        disabled={deletingId === job.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        {deletingId === job.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && (
          <div className="border-t border-slate-100 px-6 py-3 text-sm text-slate-400">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        )}
      </div>
    </motion.section>
  );
}
