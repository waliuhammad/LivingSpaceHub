export function formatPrice(amount) {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) return 'Rs.0';
  return `Rs.${Math.round(Number(amount)).toLocaleString('en-PK')}`;
}

export function formatDate(date, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return date ? date.toLocaleDateString('en-PK', opts) : '—';
}
