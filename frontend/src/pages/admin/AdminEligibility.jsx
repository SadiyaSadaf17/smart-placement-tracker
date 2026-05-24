import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, Download, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { EmptyState, ErrorState } from '../../components/ui/PageState';

const download = async (url, filename) => {
  const res = await api.get(url, { responseType: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(res.data);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export default function AdminEligibility() {
  const [driveId, setDriveId] = useState('');
  const [drives, setDrives] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/drives', { params: { limit: 100 } })
      .then((response) => setDrives(response.data.data || []))
      .catch(() => toast.error('Could not load drives'));
  }, []);

  const selectedDrive = useMemo(
    () => drives.find((drive) => drive._id === driveId),
    [drives, driveId]
  );

  const load = async (force = false) => {
    if (!driveId) return toast.error('Select a drive');
    try {
      setLoading(true);
      setError('');
      const { data: response } = await api.get(`/drives/${driveId}/eligibility-preview`, { params: { force } });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load eligibility');
    } finally {
      setLoading(false);
    }
  };

  const notify = async () => {
    const { data: response } = await api.post(`/drives/${driveId}/notify-eligible`);
    toast.success(`${response.data.notified} eligible students notified`);
  };

  const rows = data ? [...(data.eligible || []), ...(data.ineligible || [])] : [];

  return (
    <section className="space-y-6">
      <PageHeader title="Eligibility Targeting" description="Generate eligible/ineligible lists, reasons, analytics, and notifications" />
      <Card hoverable={false}>
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Placement Drive
            <select
              className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white/50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800/50"
              value={driveId}
              onChange={(event) => {
                setDriveId(event.target.value);
                setData(null);
              }}
            >
              <option value="">Select a drive</option>
              {drives.map((drive) => (
                <option key={drive._id} value={drive._id}>
                  {drive.companyName} - {drive.role} ({drive.package} LPA)
                </option>
              ))}
            </select>
          </label>
          <Button icon={RefreshCw} loading={loading} onClick={() => load(false)}>Load</Button>
          <Button variant="outline" icon={RefreshCw} onClick={() => load(true)}>Recalculate</Button>
          <Button variant="secondary" icon={Bell} disabled={!data} onClick={notify}>Notify</Button>
          <Button variant="outline" icon={Download} disabled={!data} onClick={() => download(`/drives/${driveId}/eligibility-report`, 'eligibility.xlsx')}>Export</Button>
        </div>
        {selectedDrive && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Selected: {selectedDrive.companyName} | {selectedDrive.role} | {selectedDrive.location}
          </p>
        )}
      </Card>
      {error && <ErrorState message={error} onRetry={() => load(false)} />}
      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card title="Eligible" hoverable={false}><p className="text-3xl font-bold">{data.eligibleCount}</p></Card>
            <Card title="Ineligible" hoverable={false}><p className="text-3xl font-bold">{data.ineligibleCount}</p></Card>
            <Card title="Total" hoverable={false}><p className="text-3xl font-bold">{data.total}</p></Card>
          </div>
          <Card title="Department Analytics" hoverable={false}>
            <div className="grid gap-3 md:grid-cols-3">
              {(data.departmentStats || []).map((stat) => (
                <div key={stat.department} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40">
                  <p className="font-semibold">{stat.department}</p>
                  <p className="text-sm text-slate-500">Eligible {stat.eligible} / {stat.total}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Students" hoverable={false}>
            {!rows.length ? <EmptyState title="No students" /> : (
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-slate-50 text-left dark:bg-slate-800"><tr><th className="p-3">Name</th><th className="p-3">Roll</th><th className="p-3">Dept</th><th className="p-3">Status</th><th className="p-3">Reasons</th></tr></thead>
                  <tbody>{rows.map((row) => <tr key={row.student} className="border-t border-slate-100 dark:border-slate-800"><td className="p-3">{row.fullName}</td><td className="p-3">{row.rollNumber}</td><td className="p-3">{row.department || row.branch}</td><td className="p-3">{row.eligible ? 'Eligible' : 'Ineligible'}</td><td className="p-3">{row.reasons?.join('; ') || '-'}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </section>
  );
}
