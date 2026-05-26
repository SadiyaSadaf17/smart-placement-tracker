import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, Filter, Plus, Save, Search, Trash2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/PageState';

const blankQuestion = () => ({
  question: '',
  section: 'Aptitude',
  difficulty: 'medium',
  marks: 1,
  negativeMarks: 0,
  options: ['', '', '', ''],
  correctOption: 0,
  explanation: '',
  tags: [],
});

const blankForm = {
  title: '',
  description: '',
  durationMinutes: 30,
  isPublished: false,
  allowRetake: false,
  randomizeQuestions: true,
  randomizeOptions: false,
  maxAttempts: 1,
  passingPercentage: 0,
  instructions: '',
  antiCheat: { requireFullscreen: true, maxTabSwitches: 3, maxFullscreenExits: 2, autoSubmitOnViolation: true },
  questions: [blankQuestion()],
};

export default function AdminAssessments() {
  const [tests, setTests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState('');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: '50' });
    if (search.trim()) params.set('search', search.trim());
    if (difficulty) params.set('difficulty', difficulty);
    return params.toString();
  }, [search, difficulty]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [testRes, analyticsRes] = await Promise.all([
        api.get(`/enterprise/mock-tests?${query}`),
        api.get('/enterprise/mock-tests/analytics/admin'),
      ]);
      setTests(testRes.data.data || []);
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load question bank');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [query]);

  const updateQuestion = (index, patch) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) => (questionIndex === index ? { ...question, ...patch } : question)),
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const options = [...form.questions[questionIndex].options];
    options[optionIndex] = value;
    updateQuestion(questionIndex, { options });
  };

  const editTest = (test) => {
    setEditingId(test._id);
    setForm({
      ...blankForm,
      ...test,
      questions: test.questions?.length ? test.questions.map((question) => ({
        ...blankQuestion(),
        ...question,
        tags: question.tags || [],
      })) : [blankQuestion()],
      antiCheat: { ...blankForm.antiCheat, ...(test.antiCheat || {}) },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveTest = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.questions.length || form.questions.some((question) => !question.question.trim())) {
      toast.error('Every question needs text');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        maxAttempts: Number(form.maxAttempts),
        passingPercentage: Number(form.passingPercentage),
        questions: form.questions.map((question) => ({
          ...question,
          marks: Number(question.marks),
          negativeMarks: Number(question.negativeMarks),
          correctOption: Number(question.correctOption),
          options: question.options.filter((option) => option.trim()),
        })),
      };
      if (editingId) {
        await api.put(`/enterprise/mock-tests/${editingId}`, payload);
        toast.success('Assessment updated');
      } else {
        await api.post('/enterprise/mock-tests', payload);
        toast.success('Assessment created');
      }
      setEditingId('');
      setForm(blankForm);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteTest = async (testId) => {
    if (!window.confirm('Delete this assessment?')) return;
    try {
      await api.delete(`/enterprise/mock-tests/${testId}`);
      toast.success('Assessment deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader title="Assessment Bank" description="Question bank, timed tests, scoring rules, analytics, and integrity settings" />
      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingGrid count={3} />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card title="Attempts" hoverable={false}><p className="text-3xl font-bold">{analytics?.attempts || 0}</p></Card>
            <Card title="Average" hoverable={false}><p className="text-3xl font-bold">{analytics?.average || 0}%</p></Card>
            <Card title="Best" hoverable={false}><p className="text-3xl font-bold">{analytics?.best || 0}%</p></Card>
            <Card title="Flagged" hoverable={false}><p className="text-3xl font-bold">{analytics?.flagged || 0}</p></Card>
          </div>

          <Card title={editingId ? 'Edit Assessment' : 'Create Assessment'} hoverable={false}>
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input label="Duration minutes" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
              <Input label="Max attempts" type="number" value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })} />
              <Input label="Passing %" type="number" value={form.passingPercentage} onChange={(e) => setForm({ ...form, passingPercentage: e.target.value })} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.allowRetake} onChange={(e) => setForm({ ...form, allowRetake: e.target.checked })} /> Allow retake</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.randomizeQuestions} onChange={(e) => setForm({ ...form, randomizeQuestions: e.target.checked })} /> Random questions</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.randomizeOptions} onChange={(e) => setForm({ ...form, randomizeOptions: e.target.checked })} /> Random options</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.antiCheat.requireFullscreen} onChange={(e) => setForm({ ...form, antiCheat: { ...form.antiCheat, requireFullscreen: e.target.checked } })} /> Fullscreen required</label>
              <Input label="Tab switch limit" type="number" value={form.antiCheat.maxTabSwitches} onChange={(e) => setForm({ ...form, antiCheat: { ...form.antiCheat, maxTabSwitches: Number(e.target.value) } })} />
              <Input label="Fullscreen exit limit" type="number" value={form.antiCheat.maxFullscreenExits} onChange={(e) => setForm({ ...form, antiCheat: { ...form.antiCheat, maxFullscreenExits: Number(e.target.value) } })} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.antiCheat.autoSubmitOnViolation} onChange={(e) => setForm({ ...form, antiCheat: { ...form.antiCheat, autoSubmitOnViolation: e.target.checked } })} /> Autosubmit on violation</label>
            </div>
            <textarea className="mt-4 min-h-20 w-full rounded-xl border-2 border-slate-200 bg-white/50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/50" placeholder="Instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />

            <div className="mt-6 space-y-4">
              {form.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Badge>Question {questionIndex + 1}</Badge>
                    <Button variant="ghost" size="sm" icon={Trash2} disabled={form.questions.length === 1} onClick={() => setForm((current) => ({ ...current, questions: current.questions.filter((_, index) => index !== questionIndex) }))}>Remove</Button>
                  </div>
                  <textarea className="min-h-20 w-full rounded-xl border-2 border-slate-200 bg-white/50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/50" placeholder="Question text" value={question.question} onChange={(e) => updateQuestion(questionIndex, { question: e.target.value })} />
                  <div className="mt-3 grid gap-3 md:grid-cols-5">
                    <Input label="Section" value={question.section} onChange={(e) => updateQuestion(questionIndex, { section: e.target.value })} />
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</label>
                      <select className="w-full rounded-xl border-2 border-slate-200 bg-white/50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800/50" value={question.difficulty} onChange={(e) => updateQuestion(questionIndex, { difficulty: e.target.value })}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <Input label="Marks" type="number" value={question.marks} onChange={(e) => updateQuestion(questionIndex, { marks: e.target.value })} />
                    <Input label="Negative" type="number" value={question.negativeMarks} onChange={(e) => updateQuestion(questionIndex, { negativeMarks: e.target.value })} />
                    <Input label="Correct option" type="number" min="0" value={question.correctOption} onChange={(e) => updateQuestion(questionIndex, { correctOption: e.target.value })} />
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <Input key={optionIndex} label={`Option ${optionIndex}`} value={option} onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)} />
                    ))}
                  </div>
                  <Input className="mt-3" label="Explanation" value={question.explanation} onChange={(e) => updateQuestion(questionIndex, { explanation: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" icon={Plus} onClick={() => setForm((current) => ({ ...current, questions: [...current.questions, blankQuestion()] }))}>Add Question</Button>
              <Button icon={Save} loading={saving} onClick={saveTest}>{editingId ? 'Update Assessment' : 'Create Assessment'}</Button>
              {editingId && <Button variant="secondary" onClick={() => { setEditingId(''); setForm(blankForm); }}>Cancel Edit</Button>}
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <Card title="Question Bank" hoverable={false}>
              <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <Input icon={Search} placeholder="Search title, question, tags" value={search} onChange={(e) => setSearch(e.target.value)} />
                <select className="rounded-xl border-2 border-slate-200 bg-white/50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800/50" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="">All difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <Button variant="outline" icon={Filter} onClick={load}>Apply</Button>
              </div>
              {!tests.length && <EmptyState title="No assessments found" />}
              <div className="space-y-3">
                {tests.map((test) => (
                  <div key={test._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{test.title}</p>
                        <p className="text-sm text-slate-500">{test.questions?.length || 0} questions | {test.durationMinutes} min</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={test.isPublished ? 'success' : 'warning'}>{test.isPublished ? 'Published' : 'Draft'}</Badge>
                        <Button variant="outline" size="sm" onClick={() => editTest(test)}>Edit</Button>
                        <Button variant="danger" size="sm" icon={Trash2} onClick={() => deleteTest(test._id)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Performance Analytics" hoverable={false}>
              <div className="mb-5 flex items-center gap-2 text-sm text-slate-500"><BarChart3 size={18} /> Section-wise average</div>
              {analytics?.section?.length ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.section}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="section" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="percentage" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyState title="No submitted data" />}
              <div className="mt-5 space-y-2">
                {(analytics?.difficulty || []).map((row) => (
                  <div key={row.difficulty} className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                    <span className="capitalize">{row.difficulty}</span>
                    <strong>{row.percentage}%</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
