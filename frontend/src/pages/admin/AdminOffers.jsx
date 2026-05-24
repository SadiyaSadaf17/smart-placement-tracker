import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Award, FileUp } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/PageState';
import { useFetch } from '../../hooks/useFetch';

export default function AdminOffers() {
  const fileInputRef = useRef(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const { data: offers, loading, error, refetch } = useFetch(
    () => api.get('/offers').then((r) => r.data.data || []),
    []
  );

  const verify = async (offerId, status) => {
    try {
      await api.patch(`/offers/${offerId}/verify`, { status });
      toast.success(`Offer ${status}`);
      await refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not verify offer');
    }
  };

  const uploadLetter = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedOffer) return;

    const formData = new FormData();
    formData.append('offerLetter', file);
    try {
      await api.post(`/offers/${selectedOffer}/letter`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Offer letter uploaded');
      await refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      event.target.value = '';
      setSelectedOffer(null);
    }
  };

  return (
    <section className="animate-fade-in space-y-6">
      <PageHeader title="Offers" description="Manage student offers, verification, and offer letters" />
      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={uploadLetter} />

      {error && <ErrorState message={error} onRetry={refetch} />}
      {loading && <LoadingGrid count={4} />}
      {!loading && !error && !offers?.length && (
        <EmptyState icon={Award} title="No offers found" description="Offers are created when applications are marked Selected." />
      )}

      {!loading && offers?.length > 0 && (
        <section className="grid gap-4 lg:grid-cols-2">
          {offers.map((offer) => (
            <Card key={offer._id} title={offer.studentId?.fullName} subtitle={`${offer.driveId?.companyName || ''} | ${offer.role}`} hoverable={false}>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <p>{offer.studentId?.rollNumber} | {offer.studentId?.department || offer.studentId?.branch}</p>
                <p>{offer.packageOffered} LPA | {offer.location || offer.driveId?.location || 'Location TBD'}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{offer.offerStatus}</Badge>
                  <Badge variant={offer.adminVerificationStatus === 'verified' ? 'success' : 'warning'}>
                    {offer.adminVerificationStatus}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="success" onClick={() => verify(offer._id, 'verified')}>
                  Verify
                </Button>
                <Button size="sm" variant="danger" onClick={() => verify(offer._id, 'rejected')}>
                  Reject Verification
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={FileUp}
                  onClick={() => {
                    setSelectedOffer(offer._id);
                    fileInputRef.current?.click();
                  }}
                >
                  Letter
                </Button>
              </div>
            </Card>
          ))}
        </section>
      )}
    </section>
  );
}
