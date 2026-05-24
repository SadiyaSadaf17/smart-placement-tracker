import { useState } from 'react';
import toast from 'react-hot-toast';
import { Award } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/PageState';
import { useFetch } from '../../hooks/useFetch';

const statusVariant = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
};

export default function StudentOffers() {
  const [responding, setResponding] = useState('');
  const { data: offers, loading, error, refetch } = useFetch(
    () => api.get('/offers/my').then((r) => r.data.data || []),
    []
  );

  const respond = async (offerId, status) => {
    try {
      setResponding(`${offerId}-${status}`);
      await api.patch(`/offers/${offerId}/respond`, { status });
      toast.success(`Offer ${status}`);
      await refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update offer');
    } finally {
      setResponding('');
    }
  };

  return (
    <section className="animate-fade-in space-y-6">
      <PageHeader title="My Offers" description="Review, accept, or reject placement offers" />

      {error && <ErrorState message={error} onRetry={refetch} />}
      {loading && <LoadingGrid count={3} />}
      {!loading && !error && !offers?.length && (
        <EmptyState icon={Award} title="No offers yet" description="Your selected offers will appear here." />
      )}

      {!loading && offers?.length > 0 && (
        <section className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer._id} title={offer.driveId?.companyName || offer.companyId?.name} subtitle={offer.role} hoverable={false}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {offer.packageOffered} LPA | {offer.location || offer.driveId?.location || 'Location TBD'}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusVariant[offer.offerStatus]}>{offer.offerStatus}</Badge>
                  <Badge variant={offer.adminVerificationStatus === 'verified' ? 'success' : 'default'}>
                    {offer.adminVerificationStatus}
                  </Badge>
                </div>
              </div>
              {offer.offerLetterUrl && (
                <a className="mt-3 inline-block text-sm font-medium text-blue-600 dark:text-blue-400" href={offer.offerLetterUrl} target="_blank" rel="noreferrer">
                  View offer letter
                </a>
              )}
              {offer.offerStatus === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    loading={responding === `${offer._id}-accepted`}
                    onClick={() => respond(offer._id, 'accepted')}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={responding === `${offer._id}-rejected`}
                    onClick={() => respond(offer._id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </section>
      )}
    </section>
  );
}
