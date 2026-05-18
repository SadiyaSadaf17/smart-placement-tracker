import { useEffect, useState, useCallback } from 'react';
import { Briefcase, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/companies', { params: { limit: 50 } });
      setCompanies(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load companies';
      setError(msg);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/companies', { name: name.trim() });
      setName('');
      toast.success('Company added');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add company');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Companies"
        description="Manage recruiting companies for placement drives"
        action={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        }
      />

      <Card title="Add Company">
        <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row">
          <Input
            className="flex-1"
            placeholder="Company name (e.g. TCS, Amazon)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit" loading={submitting} className="shrink-0">
            Add Company
          </Button>
        </form>
      </Card>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          <AlertCircle className="mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-medium">Could not load companies</p>
            <p className="mt-1 text-sm">{error}</p>
            <p className="mt-2 text-xs opacity-80">
              Ensure the backend is running on port 5000 and you are logged in as admin.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={load}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </section>
      )}

      {!loading && !error && companies.length === 0 && (
        <Card title="No companies yet">
          <div className="flex flex-col items-center py-8 text-center text-slate-500">
            <Briefcase size={40} className="mb-3 opacity-40" />
            <p>No companies in the database.</p>
            <p className="mt-1 text-sm">Add one above, or run <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">npm run seed</code> in the backend folder.</p>
          </div>
        </Card>
      )}

      {!loading && companies.length > 0 && (
        <section>
          <p className="mb-3 text-sm text-slate-500">{companies.length} company(ies)</p>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <Card key={c._id} title={c.name} subtitle={c.industry || c.location || 'No details'}>
                {c.website && (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {c.website}
                  </a>
                )}
              </Card>
            ))}
          </section>
        </section>
      )}
    </section>
  );
}
