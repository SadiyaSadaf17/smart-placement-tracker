import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { BRANCHES } from '../../utils/constants';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/profile').then((r) => {
      setProfile(r.data.data);
      setSkillsInput((r.data.data.skills || []).join(', '));
    }).finally(() => setLoading(false));
  }, []);

  const update = (field, value) => setProfile((p) => ({ ...p, [field]: value }));

  const save = async () => {
    try {
      const { data } = await api.put('/students/profile', {
        ...profile,
        skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setProfile(data.data);
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  if (loading || !profile) return <p>Loading...</p>;

  return (
    <Card title="My Profile" subtitle="Keep your details up to date for eligibility">
      <section className="grid gap-4 sm:grid-cols-2">
        <Input label="Full Name" value={profile.fullName || ''} onChange={(e) => update('fullName', e.target.value)} />
        <Input label="Phone" value={profile.phone || ''} onChange={(e) => update('phone', e.target.value)} />
        <Input label="Roll Number" value={profile.rollNumber || ''} disabled />
        <label className="text-sm">Branch
          <select className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800" value={profile.branch} onChange={(e) => update('branch', e.target.value)}>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        <Input label="CGPA" type="number" step="0.01" value={profile.cgpa} onChange={(e) => update('cgpa', Number(e.target.value))} />
        <Input label="Backlogs" type="number" value={profile.backlogs} onChange={(e) => update('backlogs', Number(e.target.value))} />
        <Input label="LinkedIn" value={profile.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} />
        <Input label="GitHub" value={profile.github || ''} onChange={(e) => update('github', e.target.value)} />
        <Input label="Skills (comma separated)" className="sm:col-span-2" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
      </section>
      <Button className="mt-4" onClick={save}>Save Profile</Button>
    </Card>
  );
}
