export function getStock(movements, products) {
  const totals = {};
  products.forEach((p) => {
    totals[p.id] = 0;
  });
  movements.forEach((m) => {
    if (m.movement_type === 'IN') totals[m.product_id] = (totals[m.product_id] || 0) + m.quantity;
    if (m.movement_type === 'OUT') totals[m.product_id] = (totals[m.product_id] || 0) - m.quantity;
  });
  return totals;
}

export function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
