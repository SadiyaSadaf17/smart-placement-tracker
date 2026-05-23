import { useEffect, useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Brain,
  ListChecks,
  Wrench,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { LoadingGrid, ErrorState } from '../../components/ui/PageState';

export default function StudentResume() {
  const [profile, setProfile] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, ai] = await Promise.all([
        api.get('/students/profile'),
        api.get('/students/ai-insights'),
      ]);
      setProfile(p.data.data);
      setInsights(ai.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resume data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      await api.post('/students/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const viewResume = async () => {
    try {
      const res = await api.get('/students/resume/file', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch {
      toast.error('Could not open resume');
    }
  };

  const ats = profile?.atsScore ?? insights?.atsScore ?? 0;
  const ai = profile?.aiAnalysis ?? insights?.aiAnalysis ?? null;

  const completeness = [
    { label: 'Resume PDF', ok: !!profile?.resume },
    { label: '5+ Skills', ok: (profile?.skills?.length || 0) >= 5 },
    { label: 'Projects', ok: (profile?.projects?.length || 0) >= 1 },
    { label: 'LinkedIn', ok: !!profile?.linkedin },
    { label: 'GitHub', ok: !!profile?.github },
  ];

  if (loading) return <LoadingGrid count={2} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="animate-fade-in space-y-6">
      <PageHeader title="Resume & AI Analyzer" description="ATS score, completeness, and skill insights" />

      {/* Upgraded Top Metric Dashboard */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1" title="ATS Score">
          <p className="text-5xl font-bold text-blue-600">{ats}%</p>
          <p className="mt-2 text-sm text-slate-500">Automated resume screening estimate</p>
          <section className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${ats}%` }}
            />
          </section>
        </Card>

        <Card className="lg:col-span-1" title="AI Job Readiness">
          <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            {ai?.jobReadinessLevel || 'N/A'}
          </p>
          <p className="mt-2 text-sm text-slate-500">Industry readiness classification</p>
          <section className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500">Skill Match Level:</span>
            <Badge variant={ai?.skillMatchPercentage >= 75 ? 'success' : ai?.skillMatchPercentage >= 50 ? 'warning' : 'danger'}>
              {ai?.skillMatchPercentage || 0}% Match
            </Badge>
          </section>
        </Card>

        <Card className="lg:col-span-1" title="Resume Completeness">
          <ul className="grid gap-2 sm:grid-cols-2">
            {completeness.map(({ label, ok }) => (
              <li key={label} className="flex items-center gap-2 text-sm">
                {ok ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-500" />
                )}
                {label}
              </li>
            ))}
          </ul>
          <section className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            {profile?.resume && (
              <Button variant="outline" size="sm" onClick={viewResume}>
                <FileText size={16} /> View PDF
              </Button>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              <Sparkles size={16} />
              {uploading ? 'Uploading…' : 'Upload PDF'}
              <input type="file" accept=".pdf" className="hidden" onChange={upload} disabled={uploading} />
            </label>
          </section>
        </Card>
      </section>

      {/* Upgraded Detailed AI Insights & Predictions */}
      {ai ? (
        <>
          <section className="grid gap-6 md:grid-cols-2">
            {/* Resume Improvement Suggestions */}
            <Card title="AI Improvement Suggestions" subtitle="Actionable items to boost your ATS score">
              <ul className="space-y-3">
                {ai.improvementSuggestions?.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm">
                    <Sparkles size={16} className="mt-0.5 text-amber-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">{suggestion}</span>
                  </li>
                ))}
                {(!ai.improvementSuggestions || ai.improvementSuggestions.length === 0) && (
                  <p className="text-sm text-slate-500">No suggestions available.</p>
                )}
              </ul>
            </Card>

            {/* Job Role Compatibility */}
            <Card title="Job Role Compatibility" subtitle="Matching your profile against standard industry positions">
              <section className="space-y-4">
                {ai.jobRoleCompatibility?.map(({ role, score }) => (
                  <section key={role} className="space-y-1.5">
                    <section className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{role}</span>
                      <span className="font-semibold text-blue-600">{score}%</span>
                    </section>
                    <section className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </section>
                  </section>
                ))}
                {(!ai.jobRoleCompatibility || ai.jobRoleCompatibility.length === 0) && (
                  <p className="text-sm text-slate-500">No compatibility mapping available.</p>
                )}
              </section>
            </Card>
          </section>

          {/* Detailed Evaluation Factors */}
          <Card title="Resume Evaluation Analysis" subtitle="AI breakdown of resume content quality">
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ai.evaluationFactors && Object.entries(ai.evaluationFactors).map(([key, val]) => {
                const labelMap = {
                  skillsRelevance: 'Skills Relevance',
                  projectQuality: 'Project Quality',
                  experienceLevel: 'Experience Level',
                  educationRelevance: 'Education Relevance',
                  formattingAndStructureQuality: 'Formatting & Layout',
                };
                return (
                  <section key={key} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                      <ListChecks size={16} className="text-indigo-500" />
                      {labelMap[key] || key}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{val}</p>
                  </section>
                );
              })}
            </section>
          </Card>

          {/* Extracted Skills */}
          <Card title="Extracted Skills Classifier" subtitle="Automatically parsed and categorized skills from your resume">
            <section className="grid gap-6 md:grid-cols-2">
              <section className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Wrench size={16} className="text-blue-500" />
                  Technical Skills
                </h4>
                <section className="flex flex-wrap gap-2">
                  {ai.extractedSkills?.technical?.map((skill) => (
                    <Badge key={skill} variant="info">{skill}</Badge>
                  ))}
                  {(!ai.extractedSkills?.technical || ai.extractedSkills.technical.length === 0) && (
                    <span className="text-xs text-slate-500">None detected.</span>
                  )}
                </section>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <UserCheck size={16} className="text-emerald-500" />
                  Soft Skills
                </h4>
                <section className="flex flex-wrap gap-2">
                  {ai.extractedSkills?.soft?.map((skill) => (
                    <Badge key={skill} variant="purple">{skill}</Badge>
                  ))}
                  {(!ai.extractedSkills?.soft || ai.extractedSkills.soft.length === 0) && (
                    <span className="text-xs text-slate-500">None detected.</span>
                  )}
                </section>
              </section>
            </section>
          </Card>
        </>
      ) : (
        <Card title="AI Deep Insights" className="text-center py-8">
          <Brain size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3 animate-pulse" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Detailed AI Analysis Locked</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Upload your professional resume in PDF format to generate automated scoring feedback, compatibility maps, and improvement checklists.
          </p>
        </Card>
      )}

      <Card title="Placement Prediction" subtitle={`${insights?.placementPrediction?.probability ?? 0}% estimated chance`}>
        <p className="text-sm text-slate-500">
          Based on CGPA ({profile?.cgpa}), skills ({profile?.skills?.length || 0}), and profile strength.
        </p>
      </Card>

      {(insights?.recommendations?.length > 0) && (
        <Card title="Recommended Companies" subtitle="Best matching active drives">
          <ul className="space-y-2">
            {insights.recommendations.map(({ drive, score }) => (
              <li key={drive._id} className="flex justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <span>{drive.companyName} — {drive.role}</span>
                <Badge variant="info">Match {score}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
