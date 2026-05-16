import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { btnPrimary, btnSecondary } from '../styles';
import { fmtDate, getStock } from '../helpers';

const sectionTitle = {
  fontFamily: 'var(--font-head)',
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--c-text)',
};

export default function Dashboard() {
  const { products, movements, categories, staff, loading } = useData();
  const { profile, session } = useAuth();
  const navigate = useNavigate();

  if (loading) return <PageHeader title="Dashboard" subtitle="Loading…" />;

  const stock = getStock(movements, products);
  const lowStock = products
    .filter((p) => p.is_active !== false)
    .filter((p) => (stock[p.id] ?? 0) <= p.min_stock);
  const totalIn = movements.filter((m) => m.movement_type === 'IN').reduce((s, m) => s + m.quantity, 0);
  const totalOut = movements
    .filter((m) => m.movement_type === 'OUT')
    .reduce((s, m) => s + m.quantity, 0);
  const recent = [...movements]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  const staffName = (id) => staff.find((s) => s.id === id)?.full_name || '—';

  const rawName = profile?.full_name || session?.user?.email || 'there';
  const firstName = rawName.split('@')[0].split(' ')[0];

  return (
    <div className="fade-in">
      <PageHeader
        title={'Welcome back, ' + firstName}
        subtitle={new Date().toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/writedown')} className="btn-secondary" style={btnSecondary}>
              − Write-Down
            </button>
            <button
              onClick={() => navigate('/entry')}
              className="btn-primary"
              style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Icon name="plus" size={14} /> New Entry
            </button>
          </div>
        }
      />

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard
          label="Products"
          value={products.filter((p) => p.is_active !== false).length}
          icon="products"
          sub={`across ${categories.length} categories`}
        />
        <StatCard label="Total In" value={totalIn} accent="var(--c-success)" icon="entry" sub="all-time inbound" />
        <StatCard
          label="Total Out"
          value={totalOut}
          accent="var(--c-danger)"
          icon="writedown"
          sub="all-time outbound"
        />
        <StatCard
          label="Low Stock"
          value={lowStock.length}
          accent={lowStock.length > 0 ? 'var(--c-warning)' : 'var(--c-success)'}
          icon="bell"
          sub={lowStock.length > 0 ? 'needs attention' : 'all levels OK'}
        />
      </div>

      <div className="grid-dash">
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={sectionTitle}>Recent activity</div>
            <button
              onClick={() => navigate('/reports')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--c-primary)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View all <Icon name="arrow" size={12} />
            </button>
          </div>
          <Table
            columns={[
              { key: 'product', label: 'Product' },
              { key: 'staff', label: 'Staff' },
              { key: 'type', label: 'Type' },
              { key: 'qty', label: 'Qty', right: true },
              { key: 'date', label: 'Date' },
            ]}
            rows={recent.map((m) => {
              const p = products.find((x) => x.id === m.product_id);
              return {
                product: <span style={{ fontWeight: 500 }}>{p?.name || '—'}</span>,
                staff: (
                  <span style={{ color: 'var(--c-text-muted)', fontSize: 12.5 }}>
                    {staffName(m.user_id)}
                  </span>
                ),
                type: <Badge type={m.movement_type} />,
                qty: (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: m.movement_type === 'IN' ? 'var(--c-success)' : 'var(--c-danger)',
                    }}
                  >
                    {m.movement_type === 'IN' ? '+' : '−'}
                    {m.quantity}
                  </span>
                ),
                date: (
                  <span style={{ color: 'var(--c-text-muted)', fontSize: 12.5 }}>
                    {fmtDate(m.created_at)}
                  </span>
                ),
              };
            })}
            emptyMsg="No movements recorded yet"
          />
        </div>

        <div>
          <div style={{ ...sectionTitle, marginBottom: 10 }}>Stock alerts</div>
          {lowStock.length === 0 ? (
            <div
              style={{
                background: 'var(--c-primary-soft)',
                border: '1px solid #c8d8cc',
                borderRadius: 'var(--r-lg)',
                padding: '20px 18px',
                textAlign: 'center',
                color: 'var(--c-primary)',
                fontSize: 13,
              }}
            >
              <Icon name="check" size={22} color="var(--c-primary)" />
              <br />
              All stock levels are above their minimum thresholds.
            </div>
          ) : (
            <div
              style={{
                background: 'var(--c-surface)',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--c-border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {lowStock.map((p, i) => {
                const s = stock[p.id] ?? 0;
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: i < lowStock.length - 1 ? '1px solid var(--c-border)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: s <= 0 ? 'var(--c-danger-bg)' : 'var(--c-warning-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        name="warn"
                        size={16}
                        color={s <= 0 ? 'var(--c-danger)' : 'var(--c-warning)'}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name}</div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: 'var(--c-text-muted)',
                          fontFamily: 'var(--font-mono)',
                          marginTop: 1,
                        }}
                      >
                        {p.sku}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-head)',
                          fontSize: 18,
                          fontWeight: 600,
                          color: s <= 0 ? 'var(--c-danger)' : 'var(--c-warning)',
                          lineHeight: 1,
                        }}
                      >
                        {s}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 3 }}>
                        min {p.min_stock}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <div style={{ ...sectionTitle, marginBottom: 10 }}>Categories</div>
            <div
              style={{
                background: 'var(--c-surface)',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--c-border)',
                padding: '6px 0',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {categories.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: 'var(--c-text-soft)' }}>
                  No categories
                </div>
              ) : (
                categories.map((c) => {
                  const inCat = products.filter(
                    (p) => p.category_id === c.id && p.is_active !== false
                  );
                  const total = inCat.reduce((s, p) => s + (stock[p.id] || 0), 0);
                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--c-text-muted)' }}>
                          {inCat.length} product{inCat.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--c-text)',
                        }}
                      >
                        {total}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
