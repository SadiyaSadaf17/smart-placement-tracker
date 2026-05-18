import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const roundColor = (r) => {
  if (r === 'Selected') return 'success';
  if (r === 'Rejected') return 'danger';
  return 'info';
};

export default function StudentApplications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    api.get('/applications/my').then((r) => setApps(r.data.data));
  }, []);

  return (
    <section className="space-y-4">
      {apps.map((a) => (
        <Card key={a._id} title={a.drive?.companyName} subtitle={a.drive?.role}>
          <section className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm">{a.drive?.package} LPA • {a.drive?.location}</span>
            <Badge variant={roundColor(a.currentRound)}>{a.currentRound}</Badge>
          </section>
          <p className="mt-2 text-xs text-slate-500">Applied: {new Date(a.appliedAt).toLocaleDateString()}</p>
        </Card>
      ))}
      {!apps.length && <p className="text-slate-500">No applications yet. Browse companies to apply.</p>}
    </section>
  );
}
