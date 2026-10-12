
import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Building2,
  BriefcaseBusiness,
  Trophy,
  ArrowUpRight,
  Clock3,
  Plus,
  Sparkles,
  FileCheck2,
  TrendingUp,
  RefreshCw,
  GraduationCap,
  UserRound,
  Mail,
  Phone,
  Hash,
  BookOpen,
} from 'lucide-react';

import api from './services/api';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import StatCard from './components/ui/StatCard';
import Button from './components/ui/Button';

import Login from './pages/Login';
import Register from './pages/Register';
import Students from './pages/Students';
import Companies from './pages/Companies';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Placements from './pages/Placements';

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  } catch {
    return null;
  }
}

const adminStats = [
  {
    title: 'Total Students',
    value: '—',
    change: 'Live database count',
    icon: Users,
    color: 'violet',
    endpoint: '/students',
  },
  {
    title: 'Partner Companies',
    value: '—',
    change: 'Live database count',
    icon: Building2,
    color: 'blue',
    endpoint: '/companies',
  },
  {
    title: 'Active Opportunities',
    value: '—',
    change: 'Total jobs listed',
    icon: BriefcaseBusiness,
    color: 'emerald',
    endpoint: '/jobs',
  },
  {
    title: 'Successful Placements',
    value: '—',
    change: 'Placement records',
    icon: Trophy,
    color: 'amber',
    endpoint: '/placements',
  },
];

function Overview({ onNavigate }) {
  const currentUser = getCurrentUser();
  const role = currentUser?.role?.toUpperCase();
  const isStudent = role === 'STUDENT';
  const canViewAll = role === 'ADMIN' || role === 'OFFICER';

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [placementRecords, setPlacementRecords] = useState([]);

  const loadDashboardStats = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (isStudent) {
        if (!currentUser?.id) {
          throw new Error(
            'Your account details are missing. Please log out and log in again.'
          );
        }

        const profileResponse = await api.get(
          `/students/user/${currentUser.id}`
        );
        const profile = profileResponse.data;

        if (!profile?.id) {
          throw new Error(
            'Your student profile was not found. Please contact the placement team.'
          );
        }

        setStudentProfile(profile);

        const results = await Promise.allSettled([
          api.get(`/placements/student/${profile.id}`),
          api.get('/companies'),
          api.get('/jobs'),
        ]);

        const placementResult = results[0];
        const companyResult = results[1];
        const jobResult = results[2];

        const placements =
          placementResult.status === 'fulfilled'
            ? Array.isArray(placementResult.value.data)
              ? placementResult.value.data
              : placementResult.value.data
                ? [placementResult.value.data]
                : []
            : [];

        setPlacementRecords(placements);

        const companyCount =
          companyResult.status === 'fulfilled' &&
          Array.isArray(companyResult.value.data)
            ? companyResult.value.data.length
            : null;

        const jobCount =
          jobResult.status === 'fulfilled' &&
          Array.isArray(jobResult.value.data)
            ? jobResult.value.data.length
            : null;

        setStats([
          {
            title: 'My Profile',
            value: profile.rollNumber || `Student #${profile.id}`,
            change: 'Your student account',
            icon: GraduationCap,
            color: 'violet',
          },
          {
            title: 'Partner Companies',
            value: companyCount === null ? '—' : companyCount.toLocaleString(),
            change:
              companyCount === null
                ? 'Could not load companies'
                : 'Available hiring partners',
            icon: Building2,
            color: 'blue',
          },
          {
            title: 'Job Opportunities',
            value: jobCount === null ? '—' : jobCount.toLocaleString(),
            change:
              jobCount === null
                ? 'Could not load opportunities'
                : 'Available jobs and internships',
            icon: BriefcaseBusiness,
            color: 'emerald',
          },
          {
            title: 'My Placements',
            value:
              placementResult.status === 'fulfilled'
                ? placements.length.toLocaleString()
                : '—',
            change:
              placementResult.status === 'fulfilled'
                ? 'Your placement records'
                : 'Could not load your placements',
            icon: Trophy,
            color: 'amber',
          },
        ]);

        if (results.some((result) => result.status === 'rejected')) {
          setError(
            'Some dashboard information could not be loaded. Refresh and try again.'
          );
        }
      } else if (canViewAll) {
        const results = await Promise.allSettled(
          adminStats.map((stat) => api.get(stat.endpoint))
        );

        setStats(
          adminStats.map((stat, index) => {
            const result = results[index];

            if (result.status === 'fulfilled') {
              const data = result.value.data;

              if (Array.isArray(data)) {
                return {
                  ...stat,
                  value: data.length.toLocaleString(),
                  change: 'Live database count',
                };
              }

              return {
                ...stat,
                value: '—',
                change: 'Unexpected API response',
              };
            }

            return {
              ...stat,
              value: '—',
              change:
                result.reason?.response?.status === 403
                  ? 'Access restricted'
                  : result.reason?.response?.status === 401
                    ? 'Please log in again'
                    : 'Could not load count',
            };
          })
        );

        if (results.some((result) => result.status === 'rejected')) {
          setError(
            'Some statistics could not be loaded. Check your permissions and backend connection.'
          );
        }
      } else {
        throw new Error(
          'Your account role is not recognized. Please log in again.'
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Unable to load dashboard information.'
      );
      setStats([]);
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, [isStudent, canViewAll, currentUser?.id]);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const placementStat = stats.find(
    (stat) => stat.title === 'Successful Placements'
  );
  const studentStat = stats.find(
    (stat) => stat.title === 'Total Students'
  );

  const placementCount =
    placementStat?.value !== undefined && placementStat.value !== '—'
      ? Number(String(placementStat.value).replaceAll(',', ''))
      : null;

  const studentCount =
    studentStat?.value !== undefined && studentStat.value !== '—'
      ? Number(String(studentStat.value).replaceAll(',', ''))
      : null;

  const placementRate =
    !isStudent &&
    placementCount !== null &&
    studentCount !== null &&
    studentCount > 0
      ? Math.min(100, Math.round((placementCount / studentCount) * 100))
      : null;

  const quickActions = isStudent
    ? [
        { label: 'View my profile', page: 'My Profile', icon: UserRound },
        { label: 'View companies', page: 'Companies', icon: Building2 },
        {
          label: 'Explore jobs',
          page: 'Jobs & Internships',
          icon: BriefcaseBusiness,
        },
        {
          label: 'My applications',
          page: 'My Applications',
          icon: FileCheck2,
        },
        { label: 'View my placements', page: 'Placements', icon: Trophy },
      ]
    : [
        { label: 'Manage students', page: 'Students', icon: Users },
        { label: 'Manage companies', page: 'Companies', icon: Building2 },
        {
          label: 'Manage jobs',
          page: 'Jobs & Internships',
          icon: BriefcaseBusiness,
        },
        { label: 'View applications', page: 'Applications', icon: FileCheck2 },
        { label: 'View placements', page: 'Placements', icon: Trophy },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-7"
    >
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
            <Sparkles size={14} />
            {isStudent ? 'Student workspace' : 'Placement management'}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {isStudent
              ? `Welcome, ${currentUser?.name || 'Student'}`
              : 'Dashboard overview'}
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {isStudent
              ? 'Explore opportunities and track your personal placement progress.'
              : 'Track student progress, recruitment activities, and placement outcomes in one place.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={loadDashboardStats} disabled={loading}>
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh statistics
          </Button>

          <Button onClick={() => onNavigate('Jobs & Internships')}>
            <Plus size={17} />
            Explore opportunities
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.08} />
        ))}
      </section>

      <section className="grid grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,0.8fr)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div>
              <h2 className="font-bold text-slate-900">
                {isStudent ? 'My account overview' : 'Dashboard statistics'}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {isStudent
                  ? 'Your information and accessible placement data.'
                  : 'Counts retrieved from your backend APIs.'}
              </p>
            </div>
            <FileCheck2 size={20} className="shrink-0 text-violet-600" />
          </div>

          <div className="divide-y divide-slate-100">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-slate-50 p-3 text-slate-600">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {stat.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {stat.change}
                      </p>
                    </div>
                  </div>
                  <p className="max-w-[45%] break-words text-right text-xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          {isStudent && studentProfile && (
            <div className="space-y-4 border-t border-slate-100 p-5 sm:p-6">
              <h3 className="font-bold text-slate-900">My student profile</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileField
                  label="Full name"
                  value={currentUser?.name}
                />
                <ProfileField
                  label="Email"
                  value={currentUser?.email}
                />
                <ProfileField
                  label="Roll number"
                  value={studentProfile.rollNumber}
                />
                <ProfileField
                  label="Year"
                  value={studentProfile.year}
                />
                <ProfileField
                  label="CGPA"
                  value={studentProfile.cgpa}
                />
                <ProfileField
                  label="Phone"
                  value={studentProfile.phone}
                />
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-xs text-slate-400">
              {loading
                ? 'Loading latest information…'
                : lastUpdated
                  ? `Last updated at ${lastUpdated.toLocaleTimeString()}`
                  : 'Information not loaded yet'}
            </p>
          </div>
        </motion.div>

        <div className="space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  {isStudent ? 'My placement snapshot' : 'Placement snapshot'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {isStudent
                    ? 'Your personal placement records'
                    : 'Based on current records'}
                </p>
              </div>
              <span className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <TrendingUp size={19} />
              </span>
            </div>

            {isStudent ? (
              <>
                <p className="mt-7 text-5xl font-bold tracking-tight text-slate-900">
                  {loading ? '—' : placementRecords.length.toLocaleString()}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {placementRecords.length === 0
                    ? 'No placement record is available yet.'
                    : 'Personal placement records found.'}
                </p>
              </>
            ) : (
              <>
                <div className="mt-7 flex items-end gap-1">
                  <span className="text-5xl font-bold tracking-tight text-slate-900">
                    {placementRate !== null ? placementRate : '—'}
                  </span>
                  <span className="pb-1 text-xl font-semibold text-slate-400">
                    {placementRate !== null ? '%' : ''}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {placementRate !== null
                    ? 'Placement records divided by student records'
                    : 'Rate unavailable until both counts load'}
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${placementRate ?? 0}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-400"
                  />
                </div>

                <div className="mt-3 flex justify-between gap-3 text-xs">
                  <span className="text-slate-500">Placement records</span>
                  <span className="font-bold text-violet-700">
                    {placementStat?.value ?? '—'} / {studentStat?.value ?? '—'}
                  </span>
                </div>
              </>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Hiring partners</p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {stats.find((stat) => stat.title === 'Partner Companies')
                    ?.value ?? '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Job listings</p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {stats.find(
                    (stat) =>
                      stat.title === 'Active Opportunities' ||
                      stat.title === 'Job Opportunities'
                  )?.value ?? '—'}
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Quick actions</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {isStudent
                    ? 'Explore your placement resources'
                    : 'Navigate to a management module'}
                </p>
              </div>
              <Clock3 size={19} className="text-slate-400" />
            </div>

            <div className="mt-4 space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.page}
                    type="button"
                    onClick={() => onNavigate(action.page)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-violet-50"
                  >
                    <Icon size={18} className="text-violet-600" />
                    <span className="flex-1 text-sm font-semibold text-slate-700">
                      {action.label}
                    </span>
                    <ArrowUpRight size={16} className="text-slate-400" />
                  </button>
                );
              })}
            </div>
          </motion.section>
        </div>
      </section>

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <FileCheck2 size={14} />
        {isStudent
          ? 'Your dashboard uses your own student profile and placement records.'
          : 'Dashboard counts are fetched from your backend APIs.'}
      </p>
    </motion.div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value ?? '—'}
      </p>
    </div>
  );
}

function StudentProfile() {
  const currentUser = getCurrentUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    if (!currentUser?.id) {
      setError('Your login details are missing. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/students/user/${currentUser.id}`);
      setProfile(response.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? 'Your student profile was not found. Please contact your placement officer.'
          : err.response?.status === 401
            ? 'Your session has expired. Please log in again.'
            : err.response?.status === 403
              ? 'You do not have permission to view this profile.'
              : 'Unable to load your profile. Please check the backend.'
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const fields = [
    { label: 'Full name', value: currentUser?.name, icon: UserRound },
    { label: 'Email address', value: currentUser?.email, icon: Mail },
    { label: 'Roll number', value: profile?.rollNumber, icon: Hash },
    { label: 'Phone number', value: profile?.phone, icon: Phone },
    { label: 'Academic year', value: profile?.year, icon: BookOpen },
    { label: 'CGPA', value: profile?.cgpa, icon: GraduationCap },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600">
            <UserRound size={18} />
            Student account
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View your registered personal and academic details.
          </p>
        </div>

        <button
          type="button"
          onClick={loadProfile}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh profile
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Loading your profile...
        </div>
      ) : profile ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-500 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-white">
                <GraduationCap size={34} />
              </div>
              <div className="min-w-0 text-white">
                <h2 className="break-words text-2xl font-bold">
                  {currentUser?.name || 'Student'}
                </h2>
                <p className="mt-1 text-sm text-white/80">
                  {profile.rollNumber || 'Student profile'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            {fields.map((field) => {
              const Icon = field.icon;

              return (
                <div
                  key={field.label}
                  className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6"
                >
                  <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      {field.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                      {field.value ?? 'Not provided'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
            This page currently displays your saved profile details. Profile
            editing can be enabled after the update endpoint is connected.
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}

function PlaceholderPage({ title }) {
  const descriptions = {
    Companies: 'Explore hiring partners and company information.',
    'Jobs & Internships': 'Discover openings and recruitment opportunities.',
    Applications: 'Track applications and monitor recruitment progress.',
    'My Applications': 'Track the status of your job applications.',
    Placements: 'Review placement outcomes and recruitment records.',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12"
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600">
        <BriefcaseBusiness size={26} />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {descriptions[title] ?? 'Manage placement system records.'}
      </p>
      <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
        This page is not connected yet.
      </p>
    </motion.section>
  );
}

function Dashboard() {
  const [activePage, setActivePage] = useState('Overview');
  const currentUser = getCurrentUser();
  const role = currentUser?.role?.toUpperCase();
  const isStudent = role === 'STUDENT';

  function navigate(page) {
    if (isStudent && page === 'Students') {
      setActivePage('Overview');
      return;
    }

    // Keep the sidebar label and page component names consistent.
    if (page === 'My Applications') {
      setActivePage('My Applications');
      return;
    }

    setActivePage(page);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <Sidebar activePage={activePage} onNavigate={navigate} />

      <div className="min-h-screen pl-0 md:pl-[250px]">
        <Topbar activePage={activePage} />

        <main className="mx-auto max-w-[1800px] p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {activePage === 'Overview' ? (
              <Overview key="overview" onNavigate={navigate} />
            ) : activePage === 'Students' ? (
              <Students key="students" />
            ) : activePage === 'Companies' ? (
              <Companies key="companies" />
            ) : activePage === 'Jobs & Internships' ? (
              <Jobs key="jobs" />
            ) : activePage === 'Applications' ||
              activePage === 'My Applications' ? (
              <Applications key="applications" />
            ) : activePage === 'Placements' ? (
              <Placements key="placements" />
            ) : activePage === 'My Profile' && isStudent ? (
              <StudentProfile key="my-profile" />
            ) : (
              <PlaceholderPage key={activePage} title={activePage} />
            )}
          </AnimatePresence>
        </main>

        <footer className="px-6 pb-6 pt-2 text-center text-xs text-slate-400">
          PlacePro · Student Placement Management System
        </footer>
      </div>
    </div>
  );
}

function ProtectedDashboard() {
  const token = sessionStorage.getItem('accessToken');
  return token ? <Dashboard /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
