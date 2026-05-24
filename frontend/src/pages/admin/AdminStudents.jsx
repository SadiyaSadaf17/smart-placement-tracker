import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import { LoadingGrid, ErrorState, EmptyState } from '../../components/ui/PageState';
import { BRANCHES } from '../../utils/constants';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import BulkStudentUpload from '../../components/admin/BulkStudentUpload';
import Button from '../../components/ui/Button';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/students', {
        params: { search, branch, department, batchYear, currentYear, page, limit: 15 },
      });
      setStudents(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, branch, department, batchYear, currentYear, page]);

  const resendResetLink = async (studentId) => {
    try {
      const { data } = await api.post(`/admin/students/${studentId}/password-reset`);
      toast.success(data.message || 'Password reset link sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <section className="animate-fade-in space-y-6">
      <PageHeader title="Students" description={`${total} registered students`} />

      <BulkStudentUpload onImported={load} />

      <section className="flex flex-col gap-3 sm:flex-row">
        <Input
          className="flex-1"
          placeholder="Search name or roll number..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Input
          placeholder="Department..."
          value={department}
          onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
        />
        <Input
          placeholder="Batch e.g. 2022-2026"
          value={batchYear}
          onChange={(e) => { setBatchYear(e.target.value); setPage(1); }}
        />
        <Input
          placeholder="Year"
          type="number"
          value={currentYear}
          onChange={(e) => { setCurrentYear(e.target.value); setPage(1); }}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          value={branch}
          onChange={(e) => { setBranch(e.target.value); setPage(1); }}
        >
          <option value="">All branches</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </section>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingGrid count={4} />}

      {!loading && !error && students.length === 0 && (
        <EmptyState icon={Users} title="No students found" description="Try adjusting filters or run npm run seed." />
      )}

      {!loading && students.length > 0 && (
        <section className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left dark:bg-slate-800/80">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Roll</th>
                <th className="p-3 font-medium">Branch</th>
                <th className="p-3 font-medium">Dept</th>
                <th className="p-3 font-medium">Batch</th>
                <th className="p-3 font-medium">CGPA</th>
                <th className="p-3 font-medium">ATS</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Security</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-medium">{s.fullName}</td>
                  <td className="p-3">{s.rollNumber}</td>
                  <td className="p-3">{s.branch}</td>
                  <td className="p-3">{s.department || '-'}</td>
                  <td className="p-3">{s.batchYear || '-'}</td>
                  <td className="p-3">{s.cgpa}</td>
                  <td className="p-3">{s.atsScore ?? '—'}</td>
                  <td className="p-3">
                    <Badge variant={s.placementStatus === 'placed' ? 'success' : 'default'}>
                      {s.placementStatus}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Link to={`/admin/students/${s._id}`} className="mr-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                      View
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => resendResetLink(s._id)}>
                      Send reset
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {total > 15 && (
        <section className="flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-2 py-1 text-sm text-slate-500">Page {page}</span>
          <button
            type="button"
            disabled={page * 15 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </section>
      )}
    </section>
  );
}
