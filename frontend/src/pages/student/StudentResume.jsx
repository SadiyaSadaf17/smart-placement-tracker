import { useEffect, useState } from 'react';
import { FileText, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { LoadingGrid, ErrorState } from '../../components/ui/PageState';

export default function StudentResume() {
  const [profile, setProfile] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, ai] = await Promise.all([
        api.get('/students/profile'),
        api.get('/students/ai-insights'),
      ]);
      setProfile(p.data.data);
      setInsights(ai.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resume data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      await api.post('/students/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const viewResume = async () => {
    try {
      const res = await api.get('/students/resume/file', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch {
      toast.error('Could not open resume');
    }
  };

  const ats = profile?.atsScore ?? insights?.atsScore ?? 0;
  const completeness = [
    { label: 'Resume PDF', ok: !!profile?.resume },
    { label: '5+ Skills', ok: (profile?.skills?.length || 0) >= 5 },
    { label: 'Projects', ok: (profile?.projects?.length || 0) >= 1 },
    { label: 'LinkedIn', ok: !!profile?.linkedin },
    { label: 'GitHub', ok: !!profile?.github },
  ];

  if (loading) return <LoadingGrid count={2} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="animate-fade-in space-y-6">
      <PageHeader title="Resume & AI Analyzer" description="ATS score, completeness, and skill insights" />

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1" title="ATS Score">
          <p className="text-5xl font-bold text-blue-600">{ats}%</p>
          <p className="mt-2 text-sm text-slate-500">Automated resume screening estimate</p>
          <section className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${ats}%` }}
            />
          </section>
        </Card>

        <Card className="lg:col-span-2" title="Resume Completeness">
          <ul className="grid gap-2 sm:grid-cols-2">
            {completeness.map(({ label, ok }) => (
              <li key={label} className="flex items-center gap-2 text-sm">
                {ok ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-500" />
                )}
                {label}
              </li>
            ))}
          </ul>
          <section className="mt-4 flex flex-wrap gap-2">
            {profile?.resume && (
              <Button variant="outline" size="sm" onClick={viewResume}>
                <FileText size={16} /> View PDF
              </Button>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              <Sparkles size={16} />
              {uploading ? 'Uploading…' : 'Upload PDF'}
              <input type="file" accept=".pdf" className="hidden" onChange={upload} disabled={uploading} />
            </label>
          </section>
        </Card>
      </section>

      <Card title="Placement Prediction" subtitle={`${insights?.placementPrediction?.probability ?? 0}% estimated chance`}>
        <p className="text-sm text-slate-500">
          Based on CGPA ({profile?.cgpa}), skills ({profile?.skills?.length || 0}), and profile strength.
        </p>
      </Card>

      {(insights?.recommendations?.length > 0) && (
        <Card title="Recommended Companies" subtitle="Best matching active drives">
          <ul className="space-y-2">
            {insights.recommendations.map(({ drive, score }) => (
              <li key={drive._id} className="flex justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <span>{drive.companyName} — {drive.role}</span>
                <Badge variant="info">Match {score}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
