import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function StudentCompanies() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/students/drives').then((r) => setDrives(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const apply = async (id) => {
    try {
      await api.post(`/applications/apply/${id}`);
      toast.success('Application submitted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Apply failed');
    }
  };

  if (loading) return <p>Loading drives...</p>;

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {drives.map((d) => (
        <Card key={d._id} title={d.companyName} subtitle={`${d.role} • ${d.package} LPA • ${d.location}`}>
          <p className="text-sm text-slate-500 line-clamp-2">{d.description}</p>
          <section className="mt-3 flex flex-wrap gap-2">
            <Badge variant={d.eligibility?.eligible ? 'success' : 'danger'}>
              {d.eligibility?.eligible ? 'Eligible' : 'Not Eligible'}
            </Badge>
            {d.hasApplied && <Badge variant="info">Applied</Badge>}
            <Badge>{d.driveStatus}</Badge>
          </section>
          {!d.eligibility?.eligible && (
            <ul className="mt-2 text-xs text-red-500 list-disc pl-4">
              {d.eligibility?.reasons?.map((r) => <li key={r}>{r}</li>)}
            </ul>
          )}
          <Button
            className="mt-4 w-full"
            disabled={!d.eligibility?.eligible || d.hasApplied}
            onClick={() => apply(d._id)}
          >
            {d.hasApplied ? 'Already Applied' : 'Apply Now'}
          </Button>
        </Card>
      ))}
    </section>
  );
}
