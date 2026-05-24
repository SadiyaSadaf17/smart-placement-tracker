import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { BRANCHES } from '../../utils/constants';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((s) => s.auth);

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
      <section className="mb-6 flex items-center gap-4">
        <Avatar src={user?.profileImage} name={profile.fullName} size="md" />
        <section className="min-w-0">
          <p className="truncate font-semibold text-slate-900 dark:text-white">{profile.fullName}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.rollNumber}</p>
        </section>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <Input label="Full Name" value={profile.fullName || ''} onChange={(e) => update('fullName', e.target.value)} />
        <Input label="Phone" value={profile.phone || ''} onChange={(e) => update('phone', e.target.value)} />
        <Input label="Personal Email" value={profile.personalEmail || ''} onChange={(e) => update('personalEmail', e.target.value)} />
        <Input label="College Email" value={profile.collegeEmail || ''} onChange={(e) => update('collegeEmail', e.target.value)} />
        <Input label="Date of Birth" type="date" value={profile.dateOfBirth?.slice?.(0, 10) || ''} onChange={(e) => update('dateOfBirth', e.target.value)} />
        <label className="text-sm">Gender
          <select className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800" value={profile.gender || ''} onChange={(e) => update('gender', e.target.value)}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
        <Input label="Roll Number" value={profile.rollNumber || ''} disabled />
        <Input label="Batch Year" placeholder="2022-2026" value={profile.batchYear || ''} onChange={(e) => update('batchYear', e.target.value)} />
        <Input label="Department" value={profile.department || ''} onChange={(e) => update('department', e.target.value)} />
        <Input label="Section" value={profile.section || ''} onChange={(e) => update('section', e.target.value)} />
        <Input label="Current Year" type="number" min="1" max="6" value={profile.currentYear || ''} onChange={(e) => update('currentYear', Number(e.target.value))} />
        <label className="text-sm">Branch
          <select className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800" value={profile.branch} onChange={(e) => update('branch', e.target.value)}>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        <Input label="CGPA" type="number" step="0.01" value={profile.cgpa} onChange={(e) => update('cgpa', Number(e.target.value))} />
        <Input label="Graduation %" type="number" step="0.01" value={profile.graduationPercentage || ''} onChange={(e) => update('graduationPercentage', Number(e.target.value))} />
        <Input label="10th %" type="number" step="0.01" value={profile.tenthPercentage || ''} onChange={(e) => update('tenthPercentage', Number(e.target.value))} />
        <Input label="12th %" type="number" step="0.01" value={profile.twelfthPercentage || ''} onChange={(e) => update('twelfthPercentage', Number(e.target.value))} />
        <Input label="Diploma %" type="number" step="0.01" value={profile.diplomaPercentage || ''} onChange={(e) => update('diplomaPercentage', Number(e.target.value))} />
        <Input label="Backlogs" type="number" value={profile.backlogs} onChange={(e) => update('backlogs', Number(e.target.value))} />
        <Input label="Active Backlogs" type="number" value={profile.activeBacklogs || 0} onChange={(e) => update('activeBacklogs', Number(e.target.value))} />
        <label className="text-sm">Placement Consent
          <select className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800" value={profile.placementConsentStatus || 'pending'} onChange={(e) => update('placementConsentStatus', e.target.value)}>
            <option value="pending">Pending</option>
            <option value="interested">Interested</option>
            <option value="not_interested">Not interested</option>
            <option value="higher_studies">Higher studies</option>
          </select>
        </label>
        <Input label="LinkedIn" value={profile.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} />
        <Input label="GitHub" value={profile.github || ''} onChange={(e) => update('github', e.target.value)} />
        <Input label="Address" className="sm:col-span-2" value={profile.address || ''} onChange={(e) => update('address', e.target.value)} />
        <Input label="Skills (comma separated)" className="sm:col-span-2" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
      </section>
      <Button className="mt-4" onClick={save}>Save Profile</Button>
    </Card>
  );
}
