export const roundVariant = (round) => {
  if (round === 'Selected') return 'success';
  if (round === 'Rejected') return 'danger';
  if (round === 'Applied') return 'default';
  return 'info';
};
