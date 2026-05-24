import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { ErrorState, LoadingGrid } from '../../components/ui/PageState';
import { useFetch } from '../../hooks/useFetch';

export default function AdminStudentDetail() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useFetch(() => api.get(`/admin/students/${id}/detail`).then((r) => r.data.data), [id]);
  const student = data?.student;

  return (
    <section className="space-y-6">
      <PageHeader title={student?.fullName || 'Student Profile'} description="Enterprise student placement profile" />
      {error && <ErrorState message={error} onRetry={refetch} />}
      {loading && <LoadingGrid count={4} />}
      {student && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card title="Applications" hoverable={false}><p className="text-3xl font-bold">{data.analytics.totalApplications}</p></Card>
            <Card title="Success Rate" hoverable={false}><p className="text-3xl font-bold">{data.analytics.successRate}%</p></Card>
            <Card title="ATS" hoverable={false}><p className="text-3xl font-bold">{student.atsScore || 0}%</p></Card>
            <Card title="Readiness" hoverable={false}><p className="text-3xl font-bold">{data.readiness?.score || 0}%</p></Card>
          </div>
          <Card title="Academic & Personal" hoverable={false}>
            <div className="grid gap-2 text-sm md:grid-cols-3">
              <p>Roll: {student.rollNumber}</p><p>Department: {student.department}</p><p>Batch: {student.batchYear}</p>
              <p>Section: {student.section}</p><p>CGPA: {student.cgpa}</p><p>Backlogs: {student.activeBacklogs ?? student.backlogs}</p>
              <p>10th: {student.tenthPercentage || '-'}</p><p>12th: {student.twelfthPercentage || '-'}</p><p>Graduation: {student.graduationPercentage || '-'}</p>
            </div>
          </Card>
          <Card title="Applications" hoverable={false}>{data.applications.map((app) => <p key={app._id} className="border-b py-2 text-sm">{app.drive?.companyName} | {app.currentRound}</p>)}</Card>
          <Card title="Offers" hoverable={false}>{data.offers.map((offer) => <p key={offer._id} className="border-b py-2 text-sm">{offer.driveId?.companyName} | {offer.offerStatus} | {offer.packageOffered} LPA</p>)}</Card>
        </>
      )}
    </section>
  );
}
