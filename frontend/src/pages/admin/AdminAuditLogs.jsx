import { ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/PageState';
import { useFetch } from '../../hooks/useFetch';

export default function AdminAuditLogs() {
  const { data, loading, error, refetch } = useFetch(
    () => api.get('/audit', { params: { limit: 50 } }).then((r) => r.data),
    []
  );

  const logs = data?.data || [];

  return (
    <section className="animate-fade-in space-y-6">
      <PageHeader title="Audit Logs" description="Immutable security and operational activity history" />
      {error && <ErrorState message={error} onRetry={refetch} />}
      {loading && <LoadingGrid count={4} />}
      {!loading && !error && !logs.length && (
        <EmptyState icon={ShieldCheck} title="No audit logs yet" description="System activity will appear here." />
      )}
      {!loading && logs.length > 0 && (
        <Card hoverable={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-slate-50 text-left dark:bg-slate-800">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3">{log.actorId?.email || 'System'} ({log.actorRole || 'n/a'})</td>
                    <td className="p-3 font-medium">{log.actionType}</td>
                    <td className="p-3">{log.targetEntity}</td>
                    <td className="p-3">{log.ipAddress || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}
