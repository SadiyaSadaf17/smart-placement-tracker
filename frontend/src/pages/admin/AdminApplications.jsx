import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import { LoadingGrid, ErrorState, EmptyState } from '../../components/ui/PageState';
import { ROUNDS } from '../../utils/constants';
import { roundVariant } from '../../utils/roundHelpers';

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [round, setRound] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 20 });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/applications', {
        params: { search, round, page: pagination.page, limit: pagination.limit },
      });
      setApps(data.data || []);
      setPagination((p) => ({ ...p, total: data.pagination?.total || 0 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [search, round, pagination.page, pagination.limit]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const updateRound = async (id, currentRound) => {
    try {
      await api.put(`/applications/${id}/round`, { currentRound });
      toast.success(`Updated to ${currentRound}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Applications"
        description="Review and update student application rounds"
      />

      <Card>
        <section className="flex flex-col gap-3 sm:flex-row">
          <Input
            className="flex-1"
            placeholder="Search student name or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={round}
            onChange={(e) => setRound(e.target.value)}
          >
            <option value="">All rounds</option>
            {ROUNDS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </section>
      </Card>

      {loading && <LoadingGrid count={4} />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && apps.length === 0 && (
        <EmptyState title="No applications" description="Applications appear when students apply to drives." />
      )}

      {!loading && !error && apps.length > 0 && (
        <section className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left dark:bg-slate-800/80">
              <tr>
                <th className="p-3 font-medium">Student</th>
                <th className="p-3 font-medium">Company</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a._id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-3">
                    <p className="font-medium">{a.student?.fullName}</p>
                    <p className="text-xs text-slate-500">{a.student?.rollNumber} · {a.student?.branch}</p>
                  </td>
                  <td className="p-3">{a.drive?.companyName}</td>
                  <td className="p-3">{a.drive?.role}</td>
                  <td className="p-3">
                    <Badge variant={roundVariant(a.currentRound)}>{a.currentRound}</Badge>
                  </td>
                  <td className="p-3">
                    <select
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
                      value={a.currentRound}
                      onChange={(e) => updateRound(a._id, e.target.value)}
                    >
                      {ROUNDS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {pagination.total > pagination.limit && (
        <section className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-slate-500">
            Page {pagination.page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page * pagination.limit >= pagination.total}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </Button>
        </section>
      )}
    </section>
  );
}
