import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, BookOpenCheck, CheckCircle2, Clock3, GraduationCap, MessageSquareText, TimerReset } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/PageState';

const tabs = [
  { id: 'tests', label: 'Mock Tests', icon: BookOpenCheck },
  { id: 'scores', label: 'Scores', icon: BarChart3 },
  { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
  { id: 'training', label: 'Training', icon: GraduationCap },
];

const initialState = {
  tests: [],
  results: [],
  training: [],
  feedback: [],
  mockAnalytics: null,
  feedbackAnalytics: null,
  trainingAnalytics: null,
};

export default function StudentDevelopment() {
  const [activeTab, setActiveTab] = useState('tests');
  const [state, setState] = useState(initialState);
  const [consent, setConsent] = useState('interested');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const completedTestIds = useMemo(
    () => new Set(state.results.map((result) => result.test?._id || result.test)),
    [state.results]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        testRes,
        resultRes,
        trainingRes,
        feedbackRes,
        mockAnalyticsRes,
        feedbackAnalyticsRes,
        trainingAnalyticsRes,
      ] = await Promise.all([
        api.get('/enterprise/mock-tests'),
        api.get('/enterprise/mock-tests/my/results'),
        api.get('/enterprise/training'),
        api.get('/enterprise/feedback'),
        api.get('/enterprise/mock-tests/my/analytics'),
        api.get('/enterprise/feedback/analytics'),
        api.get('/enterprise/training/analytics'),
      ]);
      setState({
        tests: testRes.data.data || [],
        results: resultRes.data.data || [],
        training: trainingRes.data.data || [],
        feedback: feedbackRes.data.data || [],
        mockAnalytics: mockAnalyticsRes.data.data,
        feedbackAnalytics: feedbackAnalyticsRes.data.data,
        trainingAnalytics: trainingAnalyticsRes.data.data,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load development data');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitTest = useCallback(async (autoSubmitted = false) => {
    if (!activeTest) return;
    const missing = activeTest.questions.filter((question) => answers[question._id] === undefined);
    if (missing.length && !autoSubmitted) {
      toast.error(`Answer all questions before submitting (${missing.length} left)`);
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/enterprise/mock-tests/${activeTest._id}/submit`, {
        autoSubmitted,
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
      });
      toast.success(autoSubmitted ? 'Time is up. Test auto-submitted' : 'Test submitted');
      setActiveTest(null);
      setTimeLeft(0);
      await load();
      setActiveTab('scores');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [activeTest, answers, load]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!activeTest || submitting) return undefined;
    if (timeLeft <= 0) {
      submitTest(true);
      return undefined;
    }

    const timer = window.setTimeout(() => setTimeLeft((current) => Math.max(current - 1, 0)), 1000);
    return () => window.clearTimeout(timer);
  }, [activeTest, submitting, submitTest, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const updateConsent = async () => {
    try {
      await api.patch('/enterprise/consent/my', { status: consent });
      toast.success('Consent updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update consent');
    }
  };

  const openTest = async (test) => {
    if (completedTestIds.has(test._id)) {
      toast.error('You have already submitted this test');
      return;
    }
    try {
      setLoadingTest(true);
      const { data } = await api.get(`/enterprise/mock-tests/${test._id}`);
      if (data.submission) {
        toast.error('You have already submitted this test');
        await load();
        return;
      }
      setTimeLeft(Number(data.data.durationMinutes || 0) * 60);
      setActiveTest(data.data);
      setAnswers({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not open test');
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader title="Development" description="Mock tests, feedback, training, and placement consent" />

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingGrid count={4} />}

      {!loading && !error && (
        <>
          <Card title="Placement Consent" hoverable={false}>
            <div className="flex flex-col gap-3 md:flex-row">
              <select className="rounded-xl border px-3 py-2 dark:bg-slate-800" value={consent} onChange={(e) => setConsent(e.target.value)}>
                <option value="interested">Interested in placements</option>
                <option value="not_interested">Not participating</option>
                <option value="higher_studies">Higher studies</option>
                <option value="pending">Pending</option>
              </select>
              <Button onClick={updateConsent}>Save Consent</Button>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            <Card title="Attempts" hoverable={false}><p className="text-3xl font-bold">{state.mockAnalytics?.attempts || 0}</p></Card>
            <Card title="Average Score" hoverable={false}><p className="text-3xl font-bold">{state.mockAnalytics?.average || 0}%</p></Card>
            <Card title="Interview Avg" hoverable={false}><p className="text-3xl font-bold">{Math.round(state.feedbackAnalytics?.avgOverall || 0)}/10</p></Card>
            <Card title="Training Attendance" hoverable={false}><p className="text-3xl font-bold">{state.trainingAnalytics?.attendancePercentage || 0}%</p></Card>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Button key={id} variant={activeTab === id ? 'primary' : 'outline'} icon={Icon} onClick={() => setActiveTab(id)}>
                {label}
              </Button>
            ))}
          </div>

          {activeTab === 'tests' && (
            <Card title="Available Mock Tests" hoverable={false}>
              {!state.tests.length && <EmptyState title="No published tests" />}
              <div className="grid gap-4 lg:grid-cols-2">
                {state.tests.map((test) => (
                <div key={test._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{test.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{test.description || 'Mock assessment'}</p>
                      </div>
                      <Badge>{test.durationMinutes} min</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                      <span>{test.questions?.length || 0} MCQs</span>
                      {completedTestIds.has(test._id) && <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 size={15} /> Completed</span>}
                    </div>
                    {test.codingLink && <a className="mt-2 block text-sm text-blue-600" href={test.codingLink} target="_blank" rel="noreferrer">Coding platform</a>}
                    <Button className="mt-4 w-full" loading={loadingTest} disabled={completedTestIds.has(test._id)} onClick={() => openTest(test)}>
                      {completedTestIds.has(test._id) ? 'Submitted' : 'Start Test'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'scores' && (
            <Card title="Score Analytics" hoverable={false}>
              {state.mockAnalytics?.trend?.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={state.mockAnalytics.trend}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="test" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="percentage" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyState title="No scores yet" />}
              <div className="mt-4 space-y-2">
                {state.results.map((result) => (
                  <div key={result._id} className="flex justify-between rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/40">
                    <span>{result.test?.title}</span>
                    <span className="font-semibold">{result.score}/{result.totalMarks} ({result.percentage}%)</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'feedback' && (
            <Card title="Interview Feedback History" hoverable={false}>
              {!state.feedback.length && <EmptyState title="No feedback yet" />}
              <div className="space-y-3">
                {state.feedback.map((item) => (
                  <div key={item._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Overall {item.overallScore}/10</p>
                      <span className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm md:grid-cols-4">
                      <span>Communication: {item.communicationScore}/10</span>
                      <span>Technical: {item.technicalScore}/10</span>
                      <span>HR: {item.hrScore}/10</span>
                      <span>Confidence: {item.confidenceScore}/10</span>
                    </div>
                    {item.feedbackNotes && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{item.feedbackNotes}</p>}
                    {!!item.improvementSuggestions?.length && (
                      <ul className="mt-2 list-disc pl-5 text-sm text-blue-600 dark:text-blue-400">
                        {item.improvementSuggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'training' && (
            <Card title="Assigned Training" hoverable={false}>
              {!state.training.length && <EmptyState title="No training assigned" />}
              <div className="grid gap-4 lg:grid-cols-2">
                {state.training.map((program) => (
                  <div key={program._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="font-semibold">{program.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{program.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(program.targetSkills || []).map((skill) => <Badge key={skill} variant="info">{skill}</Badge>)}
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                      {(program.sessions || []).length} session(s)
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {activeTest && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/60 p-4 backdrop-blur-sm">
          <Card className="mx-auto my-8 max-w-4xl" hoverable={false}>
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeTest.title}</h2>
                <p className="text-sm text-slate-500">{activeTest.durationMinutes} minutes | {activeTest.questions.length} questions</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 font-semibold ${timeLeft <= 60 ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'}`}>
                  <TimerReset size={18} />
                  {formatTime(timeLeft)}
                </span>
                <span className="inline-flex items-center gap-2 text-slate-500">
                  <Clock3 size={18} />
                  Auto-submit at 00:00
                </span>
              </div>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, (timeLeft / (activeTest.durationMinutes * 60)) * 100))}%` }}
              />
            </div>
            <p className="mb-4 text-sm text-slate-500">
              Answered {Object.keys(answers).length} of {activeTest.questions.length} questions
            </p>
            <div className="space-y-5">
              {activeTest.questions.map((question, index) => (
                <div key={question._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="font-medium">{index + 1}. {question.question}</p>
                  <div className="mt-3 grid gap-2">
                    {(question.options || []).map((option, optionIndex) => (
                      <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                        <input
                          type="radio"
                          name={question._id}
                          checked={answers[question._id] === optionIndex}
                          onChange={() => setAnswers((current) => ({ ...current, [question._id]: optionIndex }))}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" disabled={submitting} onClick={() => { setActiveTest(null); setTimeLeft(0); }}>Cancel</Button>
              <Button loading={submitting} onClick={() => submitTest(false)}>Submit Test</Button>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
