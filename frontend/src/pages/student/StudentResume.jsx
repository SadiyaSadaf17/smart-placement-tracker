import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function StudentResume() {
  const [resume, setResume] = useState(null);
  const [ats, setAts] = useState(0);

  useEffect(() => {
    api.get('/students/profile').then((r) => {
      setResume(r.data.data.resume);
      setAts(r.data.data.atsScore || 0);
    });
  }, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const { data } = await api.post('/students/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResume(data.resume);
      setAts(data.data.atsScore);
      toast.success('Resume uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <Card title="Resume & ATS" subtitle="Upload PDF resume for ATS scoring">
      <p className="text-3xl font-bold text-primary-600">{ats}% ATS Score</p>
      {resume && (
        <a href={resume} target="_blank" rel="noreferrer" className="mt-2 inline-block text-primary-600 hover:underline">
          View current resume
        </a>
      )}
      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-medium">Upload PDF (max 5MB)</span>
        <input type="file" accept=".pdf" onChange={upload} className="block w-full text-sm" />
      </label>
    </Card>
  );
}
