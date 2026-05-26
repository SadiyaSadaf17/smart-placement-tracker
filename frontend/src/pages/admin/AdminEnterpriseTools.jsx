import { useMemo, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Eye } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import { EmptyState, ErrorState } from '../../components/ui/PageState';

const download = async (url, filename) => {
  const res = await api.get(url, { responseType: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(res.data);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export default function AdminEnterpriseTools() {
  const [resumes, setResumes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [reportType, setReportType] = useState('branch-wise');
  const [reportRows, setReportRows] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [calendarTitle, setCalendarTitle] = useState('');
  const [calendarDate, setCalendarDate] = useState('');
  const [creatingEvent, setCreatingEvent] = useState(false);

  const reportColumns = useMemo(() => {
    const firstRow = reportRows[0] || {};
    return Object.keys(firstRow).filter((key) => key !== '__v');
  }, [reportRows]);

  useEffect(() => {
    api.get('/enterprise/resumes').then((r) => setResumes(r.data.data || [])).catch(() => {});
    api.get('/enterprise/templates').then((r) => setTemplates(r.data.data || [])).catch(() => {});
  }, []);

  const previewReport = async () => {
    setReportLoading(true);
    setReportError('');
    try {
      const { data } = await api.get(`/enterprise/reports/${reportType}`);
      setReportRows(data.data || []);
      toast.success('Report preview generated');
    } catch (err) {
      setReportRows([]);
      setReportError(err.response?.data?.message || 'Could not generate report preview');
    } finally {
      setReportLoading(false);
    }
  };

  const createEvent = async () => {
    if (!calendarTitle.trim()) {
      toast.error('Calendar title is required');
      return;
    }
    if (!calendarDate) {
      toast.error('Calendar date is required');
      return;
    }

    try {
      setCreatingEvent(true);
      await api.post('/enterprise/calendar', {
        title: calendarTitle.trim(),
        type: 'workshop',
        startAt: calendarDate,
        visibility: 'all',
      });
      toast.success('Calendar event created');
      setCalendarTitle('');
      setCalendarDate('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create calendar event');
    } finally {
      setCreatingEvent(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader title="Enterprise Tools" description="Resume repository, templates, reports, calendar, and bulk operations" />
      <Card title="Resume Repository" hoverable={false}>
        <div className="mb-4 flex justify-between gap-3">
          <p className="text-sm text-slate-500">{resumes.length} indexed resumes</p>
          <Button icon={Download} onClick={() => download('/enterprise/resumes/zip', 'resumes.zip')}>Download ZIP</Button>
        </div>
        <div className="max-h-72 overflow-auto">
          {!resumes.length && <EmptyState title="No resumes found" description="Uploaded student resumes will appear here." />}
          {resumes.map((student) => (
            <div key={student._id} className="flex items-center justify-between border-b py-2 text-sm">
              <span>{student.fullName} | {student.rollNumber} | {student.department || student.branch}</span>
              <a className="text-blue-600" href={student.resume} target="_blank" rel="noreferrer">Preview</a>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Import Templates" hoverable={false}>
        <div className="flex flex-wrap gap-2">
          {!templates.length && <EmptyState title="No templates available" />}
          {templates.map((template) => (
            <Button key={template} variant="outline" icon={Download} onClick={() => download(`/enterprise/templates/${template}`, `${template}-template.xlsx`)}>
              {template}
            </Button>
          ))}
        </div>
      </Card>
      <Card title="Advanced Reports" hoverable={false}>
        <div className="flex flex-col gap-3 md:flex-row">
          <select className="rounded-xl border px-3 py-2 dark:bg-slate-800" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="branch-wise">Branch-wise placement</option>
            <option value="company-wise">Company-wise selections</option>
            <option value="unplaced">Unplaced students</option>
            <option value="package-slab">Package slab</option>
            <option value="year-wise">Year-wise comparison</option>
          </select>
          <Button icon={Eye} loading={reportLoading} onClick={previewReport}>Preview</Button>
          <Button variant="secondary" icon={Download} onClick={() => download(`/enterprise/reports/${reportType}/export`, `${reportType}.xlsx`)}>Export</Button>
        </div>
        <div className="mt-5">
          {reportError && <ErrorState message={reportError} onRetry={previewReport} />}
          {!reportError && !reportLoading && reportRows.length === 0 && (
            <EmptyState title="No report preview yet" description="Choose a report type and click Preview to view records before exporting." />
          )}
          {reportLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          )}
          {!reportLoading && reportRows.length > 0 && (
            <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    {reportColumns.map((column) => (
                      <th key={column} className="px-4 py-3 text-left font-semibold capitalize text-slate-600 dark:text-slate-300">
                        {column.replace(/([A-Z])/g, ' $1').replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportRows.map((row, rowIndex) => (
                    <tr key={row._id || rowIndex} className="bg-white dark:bg-slate-900">
                      {reportColumns.map((column) => (
                        <td key={column} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {typeof row[column] === 'object' && row[column] !== null ? JSON.stringify(row[column]) : String(row[column] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
      <Card title="Placement Calendar Event" hoverable={false}>
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Title" value={calendarTitle} onChange={(e) => setCalendarTitle(e.target.value)} />
          <Input label="Date" type="datetime-local" value={calendarDate} onChange={(e) => setCalendarDate(e.target.value)} />
          <div className="flex items-end"><Button loading={creatingEvent} onClick={createEvent} className="w-full">Create Event</Button></div>
        </div>
      </Card>
    </section>
  );
}
