import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';

export default function AdminPolicies() {
  const [policy, setPolicy] = useState(null);
  useEffect(() => { api.get('/policies/placement').then((r) => setPolicy(r.data.data)); }, []);
  const update = (field, value) => setPolicy((current) => ({ ...current, [field]: value }));
  const save = async () => {
    const { data } = await api.put('/policies/placement', policy);
    setPolicy(data.data);
    toast.success('Policy saved');
  };
  if (!policy) return <p>Loading...</p>;
  return (
    <section className="space-y-6">
      <PageHeader title="Placement Policies" description="Configure offer locks, package upgrades, and dream-company rules" />
      <Card hoverable={false}>
        <div className="grid gap-4 md:grid-cols-2">
          <label><input type="checkbox" checked={policy.oneStudentOneOffer} onChange={(e) => update('oneStudentOneOffer', e.target.checked)} /> One student one offer</label>
          <label><input type="checkbox" checked={policy.lockAfterAcceptedOffer} onChange={(e) => update('lockAfterAcceptedOffer', e.target.checked)} /> Lock after accepted offer</label>
          <label><input type="checkbox" checked={policy.allowMultipleOffers} onChange={(e) => update('allowMultipleOffers', e.target.checked)} /> Allow multiple offers</label>
          <Input label="Minimum package for upgrade" type="number" value={policy.minimumPackageForUpgrade} onChange={(e) => update('minimumPackageForUpgrade', Number(e.target.value))} />
          <Input label="Dream package threshold" type="number" value={policy.dreamPackageThreshold} onChange={(e) => update('dreamPackageThreshold', Number(e.target.value))} />
          <Input label="Super dream package threshold" type="number" value={policy.superDreamPackageThreshold} onChange={(e) => update('superDreamPackageThreshold', Number(e.target.value))} />
        </div>
        <Button className="mt-4" onClick={save}>Save Policy</Button>
      </Card>
    </section>
  );
}
