import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, BarChart3, CheckCircle2, Eye, Flag, ListChecks, Maximize2, Play, Save, TimerReset, Trophy } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/PageState';

const formatTime = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0');
  const remainingSeconds = (safe % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

const answerArray = (answers) => Object.entries(answers).map(([questionId, value]) => ({
  questionId,
  selectedOption: value.selectedOption,
  markedForReview: Boolean(value.markedForReview),
  visited: Boolean(value.visited),
}));

export default function StudentAssessments() {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [review, setReview] = useState(null);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const activeRef = useRef(null);
  const answersRef = useRef({});
  const submittingRef = useRef(false);

  const completedIds = useMemo(() => new Set(results.map((item) => item.test?._id || item.test)), [results]);
  const currentQuestion = active?.test?.questions?.[currentIndex];

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [testRes, resultRes, analyticsRes] = await Promise.all([
        api.get('/enterprise/mock-tests?limit=50'),
        api.get('/enterprise/mock-tests/my/results?limit=20'),
        api.get('/enterprise/mock-tests/my/analytics'),
      ]);
      setTests(testRes.data.data || []);
      setResults(resultRes.data.data || []);
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }, []);

  const recordEvent = useCallback(async (type, detail) => {
    if (!activeRef.current || submittingRef.current) return;
    try {
      const { data } = await api.post(`/enterprise/mock-tests/attempts/${activeRef.current.attemptId}/anti-cheat`, { type, detail });
      if (data.data?.status && data.data.status !== 'in_progress') {
        toast.error('Assessment ended because the integrity limit was exceeded');
        setActive(null);
        await load();
      }
    } catch {
      // Integrity events should not interrupt the test UI when the network is flaky.
    }
  }, [load]);

  const saveProgress = useCallback(async (silent = true) => {
    if (!activeRef.current || submittingRef.current) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/enterprise/mock-tests/attempts/${activeRef.current.attemptId}/autosave`, {
        answers: answerArray(answersRef.current),
      });
      setTimeLeft(data.data.remainingSeconds);
      if (!silent) toast.success('Progress saved');
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('Time is up. Your attempt was auto-submitted.');
        setActive(null);
        await load();
      } else if (!silent) {
        toast.error(err.response?.data?.message || 'Autosave failed');
      }
    } finally {
      setSaving(false);
    }
  }, [load]);

  const submitAttempt = useCallback(async (autoSubmitted = false) => {
    if (!activeRef.current || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await api.post(`/enterprise/mock-tests/${activeRef.current.test._id}/attempts/${activeRef.current.attemptId}/submit`, {
        autoSubmitted,
        answers: answerArray(answersRef.current),
      });
      toast.success(autoSubmitted ? 'Time is up. Assessment auto-submitted.' : 'Assessment submitted');
      setActive(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!active) return undefined;
    const tick = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(tick);
          submitAttempt(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [active, submitAttempt]);

  useEffect(() => {
    if (!active) return undefined;
    const interval = window.setInterval(() => saveProgress(true), 15000);
    return () => window.clearInterval(interval);
  }, [active, saveProgress]);

  useEffect(() => {
    if (!active) return undefined;
    const onVisibility = () => {
      if (document.hidden) recordEvent('tab_switch', 'Document became hidden');
    };
    const onBlur = () => recordEvent('window_blur', 'Window lost focus');
    const onFullscreen = () => {
      if (!document.fullscreenElement) recordEvent('fullscreen_exit', 'Fullscreen exited');
    };
    const blockCopy = (event) => {
      event.preventDefault();
      recordEvent(event.type, `${event.type} blocked`);
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);
    document.addEventListener('copy', blockCopy);
    document.addEventListener('paste', blockCopy);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
      document.removeEventListener('copy', blockCopy);
      document.removeEventListener('paste', blockCopy);
    };
  }, [active, recordEvent]);

  const startTest = async (test) => {
    try {
      const { data } = await api.post(`/enterprise/mock-tests/${test._id}/start`);
      const attempt = data.data;
      const saved = {};
      attempt.test.questions.forEach((question) => {
        if (question.selectedOption !== undefined || question.markedForReview || question.visited) {
          saved[question._id] = {
            selectedOption: question.selectedOption,
            markedForReview: question.markedForReview,
            visited: question.visited,
          };
        }
      });
      setActive(attempt);
      setAnswers(saved);
      setCurrentIndex(0);
      setTimeLeft(attempt.remainingSeconds);
      if (attempt.test.antiCheat?.requireFullscreen) {
        document.documentElement.requestFullscreen?.().catch(() => toast.error('Fullscreen could not be started'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start assessment');
    }
  };

  const selectAnswer = (questionId, selectedOption) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: { ...current[questionId], selectedOption, visited: true },
    }));
  };

  const markReview = () => {
    if (!currentQuestion) return;
    setAnswers((current) => ({
      ...current,
      [currentQuestion._id]: {
        ...current[currentQuestion._id],
        visited: true,
        markedForReview: !current[currentQuestion._id]?.markedForReview,
      },
    }));
  };

  const openReview = async (attemptId) => {
    try {
      const { data } = await api.get(`/enterprise/mock-tests/attempts/${attemptId}/review`);
      setReview(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review unavailable');
    }
  };

  const loadLeaderboard = async (testId) => {
    try {
      const { data } = await api.get(`/enterprise/mock-tests/${testId}/leaderboard?limit=10`);
      setLeaderboard(data.data || []);
    } catch {
      setLeaderboard([]);
    }
  };

  if (active) {
    const answered = Object.values(answers).filter((answer) => answer.selectedOption !== undefined).length;
    return (
      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{active.test.title}</h1>
            <p className="text-sm text-slate-500">{answered}/{active.test.questions.length} answered | Autosaves every 15 seconds</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={timeLeft <= 60 ? 'danger' : 'info'}><TimerReset size={14} /> {formatTime(timeLeft)}</Badge>
            <Button variant="outline" icon={Maximize2} onClick={() => document.documentElement.requestFullscreen?.()}>Fullscreen</Button>
            <Button variant="outline" icon={Save} loading={saving} onClick={() => saveProgress(false)}>Save</Button>
            <Button variant="success" loading={submitting} onClick={() => submitAttempt(false)}>Submit</Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <Card hoverable={false}>
            {currentQuestion && (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge>Q{currentIndex + 1}</Badge>
                  <Badge variant="info">{currentQuestion.section}</Badge>
                  <Badge variant={currentQuestion.difficulty === 'hard' ? 'danger' : currentQuestion.difficulty === 'easy' ? 'success' : 'warning'}>
                    {currentQuestion.difficulty}
                  </Badge>
                  <span className="text-sm text-slate-500">+{currentQuestion.marks} / -{currentQuestion.negativeMarks}</span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{currentQuestion.question}</h2>
                <div className="mt-5 grid gap-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={`${currentQuestion._id}-${option.optionIndex}`}
                      type="button"
                      onClick={() => selectAnswer(currentQuestion._id, option.optionIndex)}
                      className={`rounded-xl border p-4 text-left text-sm transition ${
                        answers[currentQuestion._id]?.selectedOption === option.optionIndex
                          ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100'
                          : 'border-slate-200 hover:border-slate-400 dark:border-slate-700'
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap justify-between gap-2">
                  <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)}>Previous</Button>
                  <Button variant="secondary" icon={Flag} onClick={markReview}>
                    {answers[currentQuestion._id]?.markedForReview ? 'Unmark' : 'Mark Review'}
                  </Button>
                  <Button disabled={currentIndex === active.test.questions.length - 1} onClick={() => setCurrentIndex((index) => index + 1)}>Next</Button>
                </div>
              </>
            )}
          </Card>

          <Card title="Question Palette" hoverable={false}>
            <div className="grid grid-cols-5 gap-2">
              {active.test.questions.map((question, index) => {
                const state = answers[question._id] || {};
                const tone = state.markedForReview ? 'bg-amber-500 text-white' : state.selectedOption !== undefined ? 'bg-emerald-600 text-white' : index === currentIndex ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
                return (
                  <button key={question._id} type="button" onClick={() => setCurrentIndex(index)} className={`h-10 rounded-lg text-sm font-semibold ${tone}`}>
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-2 text-xs text-slate-500">
              <span><span className="mr-2 inline-block h-3 w-3 rounded bg-emerald-600" /> Answered</span>
              <span><span className="mr-2 inline-block h-3 w-3 rounded bg-amber-500" /> Marked</span>
              <span><span className="mr-2 inline-block h-3 w-3 rounded bg-slate-300" /> Not answered</span>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Assessments" description="Timed mock tests with autosave, review, analytics, and leaderboards" />
      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingGrid count={4} />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card title="Attempts" hoverable={false}><p className="text-3xl font-bold">{analytics?.attempts || 0}</p></Card>
            <Card title="Average" hoverable={false}><p className="text-3xl font-bold">{analytics?.average || 0}%</p></Card>
            <Card title="Best" hoverable={false}><p className="text-3xl font-bold">{analytics?.best || 0}%</p></Card>
            <Card title="Latest" hoverable={false}><p className="text-3xl font-bold">{analytics?.latest || 0}%</p></Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <Card title="Available Tests" hoverable={false}>
              {!tests.length && <EmptyState title="No assessments available" />}
              <div className="grid gap-4 lg:grid-cols-2">
                {tests.map((test) => (
                  <div key={test._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{test.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{test.description || 'Online assessment'}</p>
                      </div>
                      <Badge variant={completedIds.has(test._id) ? 'success' : 'info'}>{test.durationMinutes} min</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                      <span>{test.questions?.length || 0} questions</span>
                      {test.randomizeQuestions && <span>Randomized</span>}
                      {completedIds.has(test._id) && <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 size={15} /> Completed</span>}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button className="flex-1" icon={Play} disabled={completedIds.has(test._id) && !test.allowRetake} onClick={() => startTest(test)}>
                        {completedIds.has(test._id) && !test.allowRetake ? 'Submitted' : 'Start'}
                      </Button>
                      <Button variant="outline" icon={Trophy} onClick={() => loadLeaderboard(test._id)}>Ranks</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              <Card title="Score Trend" hoverable={false}>
                {analytics?.trend?.length ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.trend}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="test" hide />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <EmptyState title="No attempts yet" />}
              </Card>
              <Card title="Leaderboard" hoverable={false}>
                {!leaderboard.length && <EmptyState title="Choose Ranks on a test" />}
                <div className="space-y-2">
                  {leaderboard.map((row, index) => (
                    <div key={row._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                      <span>{index + 1}. {row.student?.fullName || 'Student'}</span>
                      <strong>{row.percentage}%</strong>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <Card title="Attempt History" hoverable={false}>
            {!results.length && <EmptyState title="No attempts submitted" />}
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result._id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{result.test?.title}</p>
                    <p className="text-slate-500">{result.score}/{result.totalMarks} | {result.percentage}% | {result.status}</p>
                  </div>
                  <Button variant="outline" icon={Eye} onClick={() => openReview(result._id)}>Review</Button>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {review && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/60 p-4 backdrop-blur-sm">
          <Card className="mx-auto my-8 max-w-5xl" title={`Review: ${review.test?.title || 'Assessment'}`} action={<Button variant="outline" onClick={() => setReview(null)}>Close</Button>} hoverable={false}>
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <Badge variant="info"><BarChart3 size={14} /> {review.attempt.percentage}%</Badge>
              <Badge variant="success">{review.attempt.correctCount} correct</Badge>
              <Badge variant="danger">{review.attempt.incorrectCount} incorrect</Badge>
              {review.attempt.antiCheat?.flagged && <Badge variant="warning"><AlertTriangle size={14} /> Flagged</Badge>}
            </div>
            <div className="space-y-4">
              {review.questions.map((question, index) => (
                <div key={question.questionId} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge>Q{index + 1}</Badge>
                    <Badge variant={question.isCorrect ? 'success' : question.selectedOption === undefined ? 'warning' : 'danger'}>
                      {question.selectedOption === undefined ? 'Unanswered' : question.isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>
                  <p className="font-semibold">{question.question}</p>
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={option} className={`rounded-lg border px-3 py-2 text-sm ${
                        optionIndex === question.correctOption ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : optionIndex === question.selectedOption ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-700'
                      }`}>
                        {option}
                      </div>
                    ))}
                  </div>
                  {question.explanation && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{question.explanation}</p>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
