import { useData } from '../context/DataContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import { fmtDate, getStock } from '../helpers';

export default function Dashboard() {
  const { products, movements, loading } = useData();

  if (loading) return <PageHeader title="Dashboard" subtitle="Loading…" />;

  const stock = getStock(movements, products);
  const lowStock = products.filter((p) => stock[p.id] <= p.min_stock);
  const totalIn = movements.filter((m) => m.movement_type === 'IN').reduce((s, m) => s + m.quantity, 0);
  const totalOut = movements
    .filter((m) => m.movement_type === 'OUT')
    .reduce((s, m) => s + m.quantity, 0);

  const recent = [...movements]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={
          'Today — ' +
          new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        }
      />

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Total Products" value={products.length} />
        <StatCard label="Total In" value={totalIn} accent="#15803d" />
        <StatCard label="Total Out" value={totalOut} accent="#b91c1c" />
        <StatCard
          label="Low Stock Alerts"
          value={lowStock.length}
          accent={lowStock.length > 0 ? '#d97706' : '#15803d'}
          sub={lowStock.length > 0 ? 'Needs attention' : 'All levels OK'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            Recent Movements
          </div>
          <Table
            columns={[
              { key: 'product', label: 'Product' },
              { key: 'type', label: 'Type' },
              { key: 'qty', label: 'Qty', right: true },
              { key: 'date', label: 'Date' },
            ]}
            rows={recent.map((m) => {
              const p = products.find((x) => x.id === m.product_id);
              return {
                product: p?.name || '—',
                type: <Badge type={m.movement_type} />,
                qty: m.quantity,
                date: fmtDate(m.created_at),
              };
            })}
            emptyMsg="No movements yet"
          />
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            Low / Out of Stock
          </div>
          {lowStock.length === 0 ? (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 10,
                padding: '20px 16px',
                textAlign: 'center',
                color: '#15803d',
                fontSize: 13,
              }}
            >
              All stock levels are above minimum thresholds.
            </div>
          ) : (
            <Table
              columns={[
                { key: 'product', label: 'Product' },
                { key: 'sku', label: 'SKU' },
                { key: 'current', label: 'Current', right: true },
                { key: 'min', label: 'Min', right: true },
              ]}
              rows={lowStock.map((p) => ({
                product: p.name,
                sku: (
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#64748b' }}>
                    {p.sku}
                  </span>
                ),
                current: (
                  <span
                    style={{
                      fontWeight: 700,
                      color: stock[p.id] <= 0 ? '#dc2626' : '#d97706',
                    }}
                  >
                    {stock[p.id]}
                  </span>
                ),
                min: p.min_stock,
              }))}
            />
          )}

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
              Stock Summary
            </div>
            <Table
              columns={[
                { key: 'product', label: 'Product' },
                { key: 'qty', label: 'Qty', right: true },
                { key: 'unit', label: 'Unit' },
                { key: 'status', label: 'Status' },
              ]}
              rows={products.map((p) => ({
                product: p.name,
                qty: stock[p.id] ?? 0,
                unit: p.unit,
                status: <Badge type={(stock[p.id] ?? 0) <= p.min_stock ? 'LOW' : 'OK'} />,
              }))}
              emptyMsg="No products yet"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
