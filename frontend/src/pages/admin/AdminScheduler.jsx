import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import { ErrorState, LoadingGrid } from '../../components/ui/PageState';
import { useFetch } from '../../hooks/useFetch';

const emptyForm = {
  drive: '',
  roundType: 'aptitude',
  title: '',
  startTime: '',
  endTime: '',
  venue: '',
  meetingLink: '',
  assignedStudents: '',
};

export default function AdminScheduler() {
  const [form, setForm] = useState(emptyForm);
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const { data, loading, error, refetch } = useFetch(() => api.get('/schedules').then((r) => r.data.data || []), []);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    Promise.all([
      api.get('/drives', { params: { limit: 100 } }),
      api.get('/admin/students', { params: { limit: 200 } }),
    ])
      .then(([driveResponse, studentResponse]) => {
        setDrives(driveResponse.data.data || []);
        setStudents(studentResponse.data.data || []);
      })
      .catch(() => toast.error('Could not load scheduler options'));
  }, []);

  const selectedStudentIds = useMemo(
    () => form.assignedStudents.split(',').map((id) => id.trim()).filter(Boolean),
    [form.assignedStudents]
  );

  const filteredStudents = useMemo(() => {
    const query = studentSearch.toLowerCase();
    return students.filter((student) =>
      [student.fullName, student.rollNumber, student.department, student.branch]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [students, studentSearch]);

  const toggleStudent = (studentId) => {
    const next = selectedStudentIds.includes(studentId)
      ? selectedStudentIds.filter((id) => id !== studentId)
      : [...selectedStudentIds, studentId];
    update('assignedStudents', next.join(','));
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/schedules', {
        drive: form.drive,
        roundType: form.roundType,
        title: form.title,
        slots: [{
          startTime: form.startTime,
          endTime: form.endTime,
          venue: form.venue,
          meetingLink: form.meetingLink,
          assignedStudents: form.assignedStudents.split(',').map((id) => id.trim()).filter(Boolean),
        }],
      });
      toast.success('Schedule created');
      setForm(emptyForm);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Schedule failed');
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader title="Round Scheduler" description="Schedule tests, interviews, slots, venues, and meeting links" />
      <Card title="Create Schedule" hoverable={false}>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Drive
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800"
              value={form.drive}
              onChange={(e) => update('drive', e.target.value)}
            >
              <option value="">Select drive</option>
              {drives.map((drive) => (
                <option key={drive._id} value={drive._id}>
                  {drive.companyName} - {drive.role}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">Round Type
            <select className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800" value={form.roundType} onChange={(e) => update('roundType', e.target.value)}>
              <option value="aptitude">Aptitude</option><option value="coding">Coding</option><option value="technical_interview">Technical Interview</option><option value="hr_interview">HR Interview</option><option value="group_discussion">Group Discussion</option>
            </select>
          </label>
          <Input label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
          <Input label="Venue" value={form.venue} onChange={(e) => update('venue', e.target.value)} />
          <Input label="Start" type="datetime-local" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} />
          <Input label="End" type="datetime-local" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} />
          <Input label="Meeting Link" value={form.meetingLink} onChange={(e) => update('meetingLink', e.target.value)} />
          <div className="md:col-span-2 space-y-3">
            <Input label="Search Students" placeholder="Search name, roll, department..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
            <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
              {filteredStudents.map((student) => (
                <label key={student._id} className="flex cursor-pointer items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 dark:border-slate-800">
                  <span>
                    <span className="font-medium text-slate-900 dark:text-white">{student.fullName}</span>
                    <span className="ml-2 text-slate-500">{student.rollNumber} | {student.department || student.branch}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(student._id)}
                    onChange={() => toggleStudent(student._id)}
                  />
                </label>
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selectedStudentIds.length} student(s) selected
            </p>
          </div>
          <Button type="submit" className="md:col-span-2">Create Schedule</Button>
        </form>
      </Card>
      {error && <ErrorState message={error} onRetry={refetch} />}
      {loading && <LoadingGrid count={3} />}
      {data?.map((schedule) => (
        <Card key={schedule._id} title={schedule.title} subtitle={`${schedule.drive?.companyName || ''} | ${schedule.roundType}`} hoverable={false}>
          {schedule.slots.map((slot) => <p key={slot._id} className="text-sm text-slate-600 dark:text-slate-400">{new Date(slot.startTime).toLocaleString()} | {slot.venue || slot.meetingLink || 'TBD'} | {slot.assignedStudents?.length || 0} students</p>)}
        </Card>
      ))}
    </section>
  );
}
