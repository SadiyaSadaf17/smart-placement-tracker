import { useEffect, useState, useCallback } from 'react';
import { Building2, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { DRIVE_STATUSES } from '../../utils/constants';

const emptyDrive = {
  companyName: '',
  role: '',
  packageLpa: '',
  location: '',
  description: '',
  driveStatus: 'upcoming',
  requiredSkills: '',
  interviewDate: '',
  eligibility: { minCgpa: 6, maxBacklogs: 0, allowedBranches: ['CSE', 'IT'] },
};

const WORKFLOW_STAGES = [
  'published',
  'applications_open',
  'applications_closed',
  'test_scheduled',
  'interview_scheduled',
  'results_published',
  'completed',
  'cancelled',
];

export default function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState(emptyDrive);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [nextStages, setNextStages] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/drives', { params: { limit: 50 } });
      setDrives(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load drives';
      setError(msg);
      setDrives([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/drives', {
        companyName: form.companyName.trim(),
        role: form.role.trim(),
        package: Number(form.packageLpa),
        location: form.location.trim(),
        description: form.description,
        driveStatus: form.driveStatus,
        requiredSkills: form.requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        interviewDate: form.interviewDate || undefined,
        eligibility: form.eligibility,
      });
      toast.success('Drive created');
      setForm(emptyDrive);
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create drive');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this drive?')) return;
    try {
      await api.delete(`/drives/${id}`);
      toast.success('Drive deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const transitionStage = async (driveId) => {
    const nextStage = nextStages[driveId];
    if (!nextStage) return toast.error('Select next workflow stage');
    try {
      await api.patch(`/drives/${driveId}/workflow`, { nextStage });
      toast.success('Drive workflow updated');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Workflow update failed');
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Placement Drives"
        description="Create and manage company placement drives"
        action={
          <section className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Create Drive'}
            </Button>
          </section>
        }
      />

      {showForm && (
        <Card title="New Placement Drive">
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Company name"
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
            <Input
              label="Role"
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <Input
              label="Package (LPA)"
              type="number"
              required
              min="0"
              step="0.1"
              value={form.packageLpa}
              onChange={(e) => setForm({ ...form, packageLpa: e.target.value })}
            />
            <Input
              label="Location"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <Input
              label="Min CGPA"
              type="number"
              step="0.1"
              value={form.eligibility.minCgpa}
              onChange={(e) =>
                setForm({
                  ...form,
                  eligibility: { ...form.eligibility, minCgpa: Number(e.target.value) },
                })
              }
            />
            <Input
              label="Max backlogs"
              type="number"
              min="0"
              value={form.eligibility.maxBacklogs}
              onChange={(e) =>
                setForm({
                  ...form,
                  eligibility: { ...form.eligibility, maxBacklogs: Number(e.target.value) },
                })
              }
            />
            <Input
              label="Required skills (comma-separated)"
              className="sm:col-span-2"
              placeholder="Java, React, DSA"
              value={form.requiredSkills}
              onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
            />
            <Input
              label="Interview date"
              type="date"
              value={form.interviewDate}
              onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
            />
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Status
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                value={form.driveStatus}
                onChange={(e) => setForm({ ...form, driveStatus: e.target.value })}
              >
                {DRIVE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium sm:col-span-2 text-slate-700 dark:text-slate-300">
              Description
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <Button type="submit" className="sm:col-span-2" loading={submitting}>
              Create Drive
            </Button>
          </form>
        </Card>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          <AlertCircle className="mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-medium">Could not load drives</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={load}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <section className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </section>
      )}

      {!loading && !error && drives.length === 0 && (
        <Card title="No drives yet">
          <div className="flex flex-col items-center py-8 text-center text-slate-500">
            <Building2 size={40} className="mb-3 opacity-40" />
            <p>No placement drives found.</p>
            <p className="mt-1 text-sm">
              Click &quot;Create Drive&quot; above or run{' '}
              <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">npm run seed</code> in backend.
            </p>
          </div>
        </Card>
      )}

      {!loading && drives.length > 0 && (
        <section>
          <p className="mb-3 text-sm text-slate-500">{drives.length} drive(s)</p>
          <section className="grid gap-4 md:grid-cols-2">
            {drives.map((d) => (
              <Card key={d._id} title={d.companyName} subtitle={`${d.role} • ${d.package} LPA`}>
                <p className="text-sm text-slate-600 dark:text-slate-400">{d.location}</p>
                <section className="mt-2 flex flex-wrap gap-2">
                  <Badge>{d.driveStatus}</Badge>
                  <Badge variant="info">{(d.workflowStage || 'draft').replaceAll('_', ' ')}</Badge>
                  {d.interviewDate && (
                    <Badge variant="info">
                      Interview: {new Date(d.interviewDate).toLocaleDateString()}
                    </Badge>
                  )}
                </section>
                {d.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{d.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <select
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                    value={nextStages[d._id] || ''}
                    onChange={(e) => setNextStages((current) => ({ ...current, [d._id]: e.target.value }))}
                  >
                    <option value="">Next stage</option>
                    {WORKFLOW_STAGES.map((stage) => (
                      <option key={stage} value={stage}>{stage.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                  <Button variant="secondary" size="sm" onClick={() => transitionStage(d._id)}>
                    Move
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => remove(d._id)}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </section>
        </section>
      )}
    </section>
  );
}
