import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const download = async (url, filename) => {
  const res = await api.get(url, { responseType: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(res.data);
  link.download = filename;
  link.click();
};

export default function AdminReports() {
  return (
    <Card title="Export Reports" subtitle="Download placement data">
      <section className="flex flex-wrap gap-3">
        <Button onClick={() => download('/reports/students/pdf', 'students.pdf')}>Students PDF</Button>
        <Button variant="secondary" onClick={() => download('/reports/students/excel', 'students.xlsx')}>Students Excel</Button>
        <Button variant="secondary" onClick={() => download('/reports/applications/excel', 'applications.xlsx')}>Applications Excel</Button>
        <Button variant="secondary" onClick={() => download('/reports/analytics/monthly/pdf', 'monthly-placement-report.pdf')}>Monthly PDF</Button>
        <Button variant="secondary" onClick={() => download('/reports/analytics/monthly/excel', 'monthly-placement-report.xlsx')}>Monthly Excel</Button>
      </section>
    </Card>
  );
}
