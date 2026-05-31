import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, UploadCloud, Users } from 'lucide-react';
import api from '../../services/api';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { EmptyState } from '../ui/PageState';

const PAGE_SIZE = 25;

const statusVariant = {
  valid: 'success',
  invalid: 'danger',
  duplicate: 'warning',
};

const downloadBlob = async (url, filename) => {
  const res = await api.get(url, { responseType: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(res.data);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const downloadCredentials = (credentials = []) => {
  const header = 'Full Name,Roll Number,Email,Temporary Password\n';
  const csv = credentials
    .map((item) =>
      [item.fullName, item.rollNumber, item.email, item.temporaryPassword]
        .map((value) => `"${String(value || '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  const blob = new Blob([header + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'student-temporary-credentials.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};

export default function BulkStudentUpload({ onImported }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batch, setBatch] = useState(null);
  const [page, setPage] = useState(1);
  const [committing, setCommitting] = useState(false);
  const [credentials, setCredentials] = useState([]);

  const rows = batch?.rows || [];
  const summary = batch?.summary;
  const totalPages = Math.max(Math.ceil((batch?.pagination?.total || 0) / PAGE_SIZE), 1);

  const validImportDisabled = !summary?.validRows || committing || uploading;

  const stats = useMemo(
    () => [
      { label: 'Total rows', value: summary?.totalRows || 0, icon: Users, color: 'text-slate-600' },
      { label: 'Valid', value: summary?.validRows || 0, icon: CheckCircle2, color: 'text-emerald-600' },
      { label: 'Invalid', value: summary?.invalidRows || 0, icon: AlertCircle, color: 'text-red-600' },
      { label: 'Duplicates', value: summary?.duplicateRows || 0, icon: AlertCircle, color: 'text-amber-600' },
    ],
    [summary]
  );

  const pickFile = (selected) => {
    const nextFile = selected?.[0];
    if (!nextFile) return;

    const validExtension = /\.(xlsx|csv)$/i.test(nextFile.name);
    if (!validExtension) {
      toast.error('Upload an .xlsx or .csv file');
      return;
    }

    setFile(nextFile);
    setBatch(null);
    setCredentials([]);
    setProgress(0);
  };

  const fetchBatchPage = async (batchId, nextPage = 1) => {
    const { data } = await api.get(`/admin/students/bulk/${batchId}`, {
      params: { page: nextPage, limit: PAGE_SIZE },
    });
    setBatch(data.data);
    setPage(nextPage);
  };

  const previewUpload = async () => {
    if (!file) {
      toast.error('Choose a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setProgress(0);

    try {
      const { data } = await api.post('/admin/students/bulk/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const percent = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
          setProgress(percent);
        },
      });
      setBatch(data.data);
      setPage(1);
      toast.success('Preview generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to parse upload');
    } finally {
      setUploading(false);
    }
  };
const commitUpload = async () => {
  if (!batch?.batchId) {
    toast.error('Batch ID is missing');
    return;
  }

  console.log('Batch ID:', batch.batchId);

  setCommitting(true);

  try {
    const response = await api.post(
      `/admin/students/bulk/${batch.batchId}/commit`
    );

    console.log('Commit Success:', response.data);

    setCredentials(response.data?.data?.credentials || []);

    toast.success(
      `${response.data?.data?.imported || 0} students imported`
    );

    onImported?.();

    await fetchBatchPage(batch.batchId, page);
  } catch (err) {
    console.error('Commit Error:', err);
    console.error('Status:', err.response?.status);
    console.error('Response:', err.response?.data);

    toast.error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Import failed'
    );
  } finally {
    setCommitting(false);
  }
};
  return (
    <Card title="Bulk Student Upload" subtitle="Preview, validate, and import students from Excel or CSV" hoverable={false}>
      <div className="space-y-5">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pickFile(event.dataTransfer.files);
          }}
          className={`flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
            dragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-slate-300 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/30'
          }`}
        >
          <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400">
            <UploadCloud size={28} />
          </div>
          <p className="mt-3 font-semibold text-slate-900 dark:text-white">
            {file ? file.name : 'Drop student spreadsheet here'}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Supports .xlsx and .csv up to 10 MB. Imported students use default password student123.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={(event) => pickFile(event.target.files)}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" icon={FileSpreadsheet} onClick={() => inputRef.current?.click()}>
              Choose File
            </Button>
            <Button icon={UploadCloud} onClick={previewUpload} loading={uploading}>
              Generate Preview
            </Button>
          </div>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Uploading</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {summary && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className={`flex items-center gap-2 ${color}`}>
                  <Icon size={18} />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        )}

        {batch && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={commitUpload} disabled={validImportDisabled} loading={committing}>
              Import Valid Rows
            </Button>
            {(summary?.invalidRows > 0 || summary?.duplicateRows > 0) && (
              <Button
                variant="secondary"
                icon={Download}
                onClick={() => downloadBlob(`/admin/students/bulk/${batch.batchId}/errors`, 'student-upload-errors.xlsx')}
              >
                Error Report
              </Button>
            )}
            {credentials.length > 0 && (
              <Button variant="outline" icon={Download} onClick={() => downloadCredentials(credentials)}>
                Credentials CSV
              </Button>
            )}
          </div>
        )}

        {batch && rows.length === 0 && (
          <EmptyState icon={FileSpreadsheet} title="No rows found" description="Check that the spreadsheet has headers and student data." />
        )}

        {rows.length > 0 && (
          <div className="space-y-3">
            <div className="max-h-[520px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left dark:bg-slate-800">
                  <tr>
                    <th className="p-3 font-medium">Row</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Roll</th>
                    <th className="p-3 font-medium">Branch</th>
                    <th className="p-3 font-medium">CGPA</th>
                    <th className="p-3 font-medium">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.rowNumber} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="p-3">{row.rowNumber}</td>
                      <td className="p-3">
                        <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                      </td>
                      <td className="p-3 font-medium">{row.data.fullName || '-'}</td>
                      <td className="p-3">{row.data.email || '-'}</td>
                      <td className="p-3">{row.data.rollNumber || '-'}</td>
                      <td className="p-3">{row.data.branch || '-'}</td>
                      <td className="p-3">{row.data.cgpa ?? '-'}</td>
                      <td className="p-3">
                        {row.errors?.length ? (
                          <div className="space-y-1">
                            {row.errors.map((error, index) => (
                              <p key={`${error.field}-${index}`} className="text-xs text-red-600 dark:text-red-400">
                                {error.message}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">Ready</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => fetchBatchPage(batch.batchId, page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => fetchBatchPage(batch.batchId, page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
