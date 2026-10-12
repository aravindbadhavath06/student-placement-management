
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Globe,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import api from '../services/api';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
  });

  const loadCompanies = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');
    setMessage('');

    try {
      const response = await api.get('/companies');
      setCompanies(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Your session has expired. Please log in again.'
          : err.response?.status === 403
            ? 'You do not have permission to view companies.'
            : err.response?.data?.message ||
              'Unable to load companies. Check whether the backend is running.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return companies;

    return companies.filter((company) =>
      [
        company.name,
        company.description,
        company.website,
        company.location,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [companies, search]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }

    setSaving(true);

    try {
      await api.post('/companies', {
        name: form.name.trim(),
        description: form.description.trim(),
        website: form.website.trim(),
        location: form.location.trim(),
      });

      setForm({
        name: '',
        description: '',
        website: '',
        location: '',
      });
      setShowForm(false);
      setMessage('Company added successfully.');
      await loadCompanies();
    } catch (err) {
      setError(
        err.response?.status === 403
          ? 'You do not have permission to add companies.'
          : err.response?.status === 409
            ? 'This company already exists.'
            : err.response?.data?.message ||
              (typeof err.response?.data === 'string'
                ? err.response.data
                : 'Could not add the company.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (company) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${company.name}?`
    );

    if (!confirmed) return;

    setError('');
    setMessage('');
    setDeletingId(company.id);

    try {
      await api.delete(`/companies/${company.id}`);
      setCompanies((previous) =>
        previous.filter((item) => item.id !== company.id)
      );
      setMessage(`${company.name} deleted successfully.`);
    } catch (err) {
      setError(
        err.response?.status === 403
          ? 'Only an administrator can delete companies.'
          : err.response?.status === 404
            ? 'This company was not found. Refresh the list.'
            : 'Could not delete the company.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100';

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
            <Building2 size={18} />
            Company management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Companies
          </h1>
          <p className="mt-2 text-slate-500">
            Explore hiring partners and manage company information.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => loadCompanies(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          <button
            onClick={() => {
              setError('');
              setMessage('');
              setShowForm((previous) => !previous);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancel' : 'Add company'}
          </button>
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

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCreate}
          className="space-y-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900">
            Add a company
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Company name *
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Google"
                className={inputClass}
                maxLength={255}
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Location
              <input
                name="location"
                value={form.location}
                onChange={handleFormChange}
                placeholder="e.g. Hyderabad"
                className={inputClass}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Website
              <input
                name="website"
                type="url"
                value={form.website}
                onChange={handleFormChange}
                placeholder="https://example.com"
                className={inputClass}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Description
              <input
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Brief company description"
                className={inputClass}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save company'}
          </button>
        </motion.form>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total companies returned
            </p>
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Building2 size={22} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {loading ? '—' : companies.length}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Live count from the API
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="company-search"
            className="mb-3 block text-sm font-semibold text-slate-800"
          >
            Search companies
          </label>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="company-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, location, website..."
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-bold text-slate-900">Company directory</h2>
          <p className="mt-1 text-sm text-slate-500">
            Companies supplied by your Spring Boot API.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
            <RefreshCw size={19} className="animate-spin" />
            Loading companies...
          </div>
        ) : error && companies.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Check the error above, then try Refresh.
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Building2
              size={34}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="font-semibold text-slate-700">
              No companies found
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {search
                ? 'Try a different search term.'
                : 'Add a company or create one in the backend first.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCompanies.map((company) => (
              <motion.article
                key={company.id}
                layout
                className="flex flex-col justify-between gap-4 px-6 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Building2 size={22} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {company.name}
                    </h3>

                    {company.description && (
                      <p className="mt-1 break-words text-sm text-slate-500">
                        {company.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                      {company.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={15} />
                          {company.location}
                        </span>
                      )}

                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-violet-600 hover:underline"
                        >
                          <Globe size={15} />
                          Visit website
                        </a>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Company ID: {company.id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(company)}
                  disabled={deletingId === company.id}
                  title="Delete company (admin only)"
                  className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:self-center"
                >
                  <Trash2 size={16} />
                  {deletingId === company.id ? 'Deleting...' : 'Delete'}
                </button>
              </motion.article>
            ))}
          </div>
        )}

        {!loading && filteredCompanies.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-3 text-sm text-slate-400">
            Showing {filteredCompanies.length} of {companies.length} companies
          </div>
        )}
      </div>
    </motion.section>
  );
}
