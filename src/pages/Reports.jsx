import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import { fmtDate, fmtDateTime } from '../helpers';

const filterLabel = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--c-text-muted)',
  display: 'block',
  marginBottom: 4,
};

const sectionTitle = {
  fontFamily: 'var(--font-head)',
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--c-text)',
  marginBottom: 10,
};

export default function Reports() {
  const { products, categories, movements, staff } = useData();
  const location = useLocation();

  const [filterProduct, setFilterProduct] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStaff, setFilterStaff] = useState(location.state?.staffId || '');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterType, setFilterType] = useState('');

  const staffName = (id) => staff.find((s) => s.id === id)?.full_name || '—';

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      if (filterProduct && m.product_id !== parseInt(filterProduct)) return false;
      if (filterStaff && m.user_id !== filterStaff) return false;
      if (filterCategory) {
        const p = products.find((x) => x.id === m.product_id);
        if (!p || p.category_id !== parseInt(filterCategory)) return false;
      }
      if (filterType && m.movement_type !== filterType) return false;
      if (filterFrom && new Date(m.created_at) < new Date(filterFrom)) return false;
      if (filterTo && new Date(m.created_at) > new Date(filterTo + 'T23:59:59')) return false;
      return true;
    });
  }, [movements, products, filterProduct, filterStaff, filterCategory, filterType, filterFrom, filterTo]);

  const byProduct = useMemo(() => {
    const map = {};
    filtered.forEach((m) => {
      if (!map[m.product_id]) map[m.product_id] = { in: 0, out: 0 };
      if (m.movement_type === 'IN') map[m.product_id].in += m.quantity;
      if (m.movement_type === 'OUT') map[m.product_id].out += m.quantity;
    });
    return map;
  }, [filtered]);

  const totalIn = filtered.filter((m) => m.movement_type === 'IN').reduce((s, m) => s + m.quantity, 0);
  const totalOut = filtered
    .filter((m) => m.movement_type === 'OUT')
    .reduce((s, m) => s + m.quantity, 0);

  function exportCSV() {
    const header = 'Date,Product,SKU,Type,Quantity,Recorded by,Notes\n';
    const safe = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filtered
      .map((m) => {
        const p = products.find((x) => x.id === m.product_id);
        return [
          safe(fmtDateTime(m.created_at)),
          safe(p?.name || ''),
          safe(p?.sku || ''),
          safe(m.movement_type),
          safe(m.quantity),
          safe(staffName(m.user_id)),
          safe(m.notes || ''),
        ].join(',');
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredProducts = filterCategory
    ? products.filter((p) => p.category_id === parseInt(filterCategory))
    : products;

  return (
    <div className="fade-in">
      <PageHeader title="Stock Report" subtitle="Filter and analyse stock movements" />

      <div
        style={{
          background: 'var(--c-surface)',
          borderRadius: 'var(--r-lg)',
          border: '1px solid var(--c-border)',
          padding: '16px 20px',
          marginBottom: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--c-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 12,
          }}
        >
          Filters
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 150px' }}>
            <label style={filterLabel}>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterProduct('');
              }}
              style={inputStyle}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={filterLabel}>Product</label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              style={inputStyle}
            >
              <option value="">All products</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={filterLabel}>Staff member</label>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              style={inputStyle}
            >
              <option value="">All staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 110px' }}>
            <label style={filterLabel}>Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={inputStyle}>
              <option value="">IN + OUT</option>
              <option value="IN">IN only</option>
              <option value="OUT">OUT only</option>
            </select>
          </div>
          <div style={{ flex: '1 1 130px' }}>
            <label style={filterLabel}>From</label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '1 1 130px' }}>
            <label style={filterLabel}>To</label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button
            className="btn-secondary"
            onClick={() => {
              setFilterProduct('');
              setFilterCategory('');
              setFilterStaff('');
              setFilterFrom('');
              setFilterTo('');
              setFilterType('');
            }}
            style={{ ...btnSecondary, height: 40, whiteSpace: 'nowrap' }}
          >
            Clear
          </button>
          <button
            className="btn-primary"
            onClick={exportCSV}
            style={{
              ...btnPrimary,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <Icon name="export" size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Movements" value={filtered.length} />
        <StatCard label="Total IN" value={totalIn} accent="var(--c-success)" />
        <StatCard label="Total OUT" value={totalOut} accent="var(--c-danger)" />
        <StatCard
          label="Net Change"
          value={(totalIn - totalOut >= 0 ? '+' : '') + (totalIn - totalOut)}
          accent={totalIn - totalOut >= 0 ? 'var(--c-success)' : 'var(--c-danger)'}
        />
      </div>

      <div className="grid-halves">
        <div>
          <div style={sectionTitle}>Summary by product</div>
          <Table
            columns={[
              { key: 'product', label: 'Product' },
              { key: 'in', label: 'IN', right: true },
              { key: 'out', label: 'OUT', right: true },
              { key: 'net', label: 'Net', right: true },
            ]}
            rows={Object.entries(byProduct).map(([pid, d]) => {
              const p = products.find((x) => x.id === parseInt(pid));
              const net = d.in - d.out;
              return {
                product: <span style={{ fontWeight: 500 }}>{p?.name || '—'}</span>,
                in: (
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-success)', fontWeight: 600 }}>
                    {d.in}
                  </span>
                ),
                out: (
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-danger)', fontWeight: 600 }}>
                    {d.out}
                  </span>
                ),
                net: (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: net >= 0 ? 'var(--c-success)' : 'var(--c-danger)',
                      fontWeight: 700,
                    }}
                  >
                    {net >= 0 ? '+' : ''}
                    {net}
                  </span>
                ),
              };
            })}
            emptyMsg="No movements match filters"
          />
        </div>

        <div>
          <div style={sectionTitle}>Movement log ({filtered.length})</div>
          <div style={{ maxHeight: 460, overflowY: 'auto', borderRadius: 'var(--r-lg)' }}>
            <Table
              columns={[
                { key: 'date', label: 'Date' },
                { key: 'product', label: 'Product' },
                { key: 'by', label: 'Recorded by' },
                { key: 'type', label: 'Type' },
                { key: 'qty', label: 'Qty', right: true },
              ]}
              rows={[...filtered]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((m) => {
                  const p = products.find((x) => x.id === m.product_id);
                  return {
                    date: (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11.5,
                          color: 'var(--c-text-muted)',
                        }}
                      >
                        {fmtDate(m.created_at)}
                      </span>
                    ),
                    product: p?.name,
                    by: (
                      <span style={{ fontSize: 12.5, color: 'var(--c-text-muted)' }}>
                        {staffName(m.user_id)}
                      </span>
                    ),
                    type: <Badge type={m.movement_type} />,
                    qty: (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: m.movement_type === 'IN' ? 'var(--c-success)' : 'var(--c-danger)',
                        }}
                      >
                        {m.movement_type === 'IN' ? '+' : '−'}
                        {m.quantity}
                      </span>
                    ),
                  };
                })}
              emptyMsg="No movements match filters"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
