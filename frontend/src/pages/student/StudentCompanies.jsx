import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FileUp, Send } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

const createInitialForm = (profile, user) => ({
  fullName: profile?.fullName || '',
  resume: null,
  immediateJoiner: '',
  expectedStipend: '',
  contactDetails: [profile?.phone, user?.email].filter(Boolean).join(' | '),
  additionalNotes: '',
});

export default function StudentCompanies() {
  const { user, profile } = useSelector((s) => s.auth);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [form, setForm] = useState(() => createInitialForm(profile, user));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/students/drives').then((r) => setDrives(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openApplyModal = (drive) => {
    setSelectedDrive(drive);
    setForm(createInitialForm(profile, user));
    setErrors({});
  };

  const closeApplyModal = () => {
    if (submitting) return;
    setSelectedDrive(null);
    setErrors({});
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrors((current) => ({ ...current, resume: 'Resume must be a PDF file' }));
      event.target.value = '';
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setErrors((current) => ({ ...current, resume: 'Resume must be 5 MB or smaller' }));
      event.target.value = '';
      return;
    }

    updateField('resume', file);
  };

  const validate = () => {
    const nextErrors = {};
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Full name is required';
    if (!form.resume) nextErrors.resume = 'Upload your resume PDF';
    if (!form.immediateJoiner) nextErrors.immediateJoiner = 'Select an option';
    if (form.expectedStipend === '' || Number(form.expectedStipend) < 0) {
      nextErrors.expectedStipend = 'Enter a valid stipend';
    }
    if (form.contactDetails.trim().length < 5) nextErrors.contactDetails = 'Contact details are required';
    if (form.additionalNotes.length > 1000) nextErrors.additionalNotes = 'Keep notes under 1000 characters';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!selectedDrive || !validate()) return;

    const formData = new FormData();
    formData.append('fullName', form.fullName.trim());
    formData.append('resume', form.resume);
    formData.append('immediateJoiner', form.immediateJoiner);
    formData.append('expectedStipend', form.expectedStipend);
    formData.append('contactDetails', form.contactDetails.trim());
    formData.append('additionalNotes', form.additionalNotes.trim());

    try {
      setSubmitting(true);
      await api.post(`/applications/apply/${selectedDrive._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Application submitted');
      setSelectedDrive(null);
      load();
    } catch (error) {
      const message = error.response?.data?.message || 'Apply failed';
      setErrors((current) => ({ ...current, form: message }));
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading drives...</p>;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2">
        {drives.map((d) => (
          <Card key={d._id} title={d.companyName} subtitle={`${d.role} | ${d.package} LPA | ${d.location}`}>
            <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{d.description}</p>
            <section className="mt-3 flex flex-wrap gap-2">
              <Badge variant={d.eligibility?.eligible ? 'success' : 'danger'}>
                {d.eligibility?.eligible ? 'Eligible' : 'Not Eligible'}
              </Badge>
              {d.hasApplied && <Badge variant="info">Applied</Badge>}
              <Badge>{d.driveStatus}</Badge>
            </section>
            {!d.eligibility?.eligible && (
              <ul className="mt-2 list-disc pl-4 text-xs text-red-500">
                {d.eligibility?.reasons?.map((r) => <li key={r}>{r}</li>)}
              </ul>
            )}
            <Button
              type="button"
              className="mt-4 w-full"
              disabled={!d.eligibility?.eligible || d.hasApplied}
              onClick={() => openApplyModal(d)}
            >
              {d.hasApplied ? 'Already Applied' : 'Apply Now'}
            </Button>
          </Card>
        ))}
      </section>

      <Modal
        isOpen={Boolean(selectedDrive)}
        onClose={closeApplyModal}
        title={`Apply to ${selectedDrive?.companyName || 'Company'}`}
        size="2xl"
        footer={
          <>
            <Button type="button" variant="outline" disabled={submitting} onClick={closeApplyModal}>
              Cancel
            </Button>
            <Button type="submit" form="application-form" icon={Send} loading={submitting}>
              Submit application
            </Button>
          </>
        }
      >
        <form id="application-form" className="space-y-4" onSubmit={submitApplication}>
          <section className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
            {selectedDrive?.role} | {selectedDrive?.package} LPA | {selectedDrive?.location}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              value={form.fullName}
              error={errors.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
            />
            <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Immediate Joiner
              <select
                className={`mt-1 w-full rounded-xl border-2 bg-white/50 px-3 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 ${errors.immediateJoiner ? 'border-red-500' : 'border-slate-200'}`}
                value={form.immediateJoiner}
                onChange={(e) => updateField('immediateJoiner', e.target.value)}
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {errors.immediateJoiner && <p className="text-xs font-medium text-red-600">{errors.immediateJoiner}</p>}
            </label>
            <Input
              label="Expected Stipend"
              type="number"
              min="0"
              value={form.expectedStipend}
              error={errors.expectedStipend}
              onChange={(e) => updateField('expectedStipend', e.target.value)}
            />
            <Input
              label="Contact Details"
              value={form.contactDetails}
              error={errors.contactDetails}
              onChange={(e) => updateField('contactDetails', e.target.value)}
            />
          </section>

          <section>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-4 text-sm font-medium text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300">
              <FileUp size={18} />
              <span className="truncate">{form.resume?.name || 'Upload resume PDF'}</span>
              <input type="file" accept="application/pdf" className="sr-only" onChange={handleResumeChange} />
            </label>
            {errors.resume ? (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.resume}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PDF only, up to 5 MB.</p>
            )}
          </section>

          <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Additional Notes / Details
            <textarea
              rows={4}
              value={form.additionalNotes}
              onChange={(e) => updateField('additionalNotes', e.target.value)}
              className={`mt-1 w-full resize-none rounded-xl border-2 bg-white/50 px-3 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 ${errors.additionalNotes ? 'border-red-500' : 'border-slate-200'}`}
            />
            {errors.additionalNotes && <p className="text-xs font-medium text-red-600">{errors.additionalNotes}</p>}
          </label>

          {errors.form && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {errors.form}
            </p>
          )}
        </form>
      </Modal>
    </>
  );
}
