import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import { fmtDate, fmtDateTime } from '../helpers';

export default function Reports() {
  const { products, categories, movements } = useData();

  const [filterProduct, setFilterProduct] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterType, setFilterType] = useState('');

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      if (filterProduct && m.product_id !== parseInt(filterProduct)) return false;
      if (filterCategory) {
        const p = products.find((x) => x.id === m.product_id);
        if (!p || p.category_id !== parseInt(filterCategory)) return false;
      }
      if (filterType && m.movement_type !== filterType) return false;
      if (filterFrom && new Date(m.created_at) < new Date(filterFrom)) return false;
      if (filterTo && new Date(m.created_at) > new Date(filterTo + 'T23:59:59')) return false;
      return true;
    });
  }, [movements, products, filterProduct, filterCategory, filterType, filterFrom, filterTo]);

  const byProduct = useMemo(() => {
    const map = {};
    filtered.forEach((m) => {
      if (!map[m.product_id]) map[m.product_id] = { in: 0, out: 0, count: 0 };
      if (m.movement_type === 'IN') map[m.product_id].in += m.quantity;
      if (m.movement_type === 'OUT') map[m.product_id].out += m.quantity;
      map[m.product_id].count++;
    });
    return map;
  }, [filtered]);

  const totalIn = filtered.filter((m) => m.movement_type === 'IN').reduce((s, m) => s + m.quantity, 0);
  const totalOut = filtered
    .filter((m) => m.movement_type === 'OUT')
    .reduce((s, m) => s + m.quantity, 0);

  function exportCSV() {
    const header = 'Date,Product,SKU,Type,Quantity,Notes\n';
    const rows = filtered
      .map((m) => {
        const p = products.find((x) => x.id === m.product_id);
        const safe = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        return [
          safe(fmtDateTime(m.created_at)),
          safe(p?.name || ''),
          safe(p?.sku || ''),
          safe(m.movement_type),
          safe(m.quantity),
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
    <div>
      <PageHeader title="Stock Report" subtitle="Filter and analyse stock movements" />

      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
          Filters
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: '1 1 160px' }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#64748b',
                display: 'block',
                marginBottom: 4,
              }}
            >
              Category
            </label>
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
          <div style={{ flex: '1 1 180px' }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#64748b',
                display: 'block',
                marginBottom: 4,
              }}
            >
              Product
            </label>
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
          <div style={{ flex: '1 1 120px' }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#64748b',
                display: 'block',
                marginBottom: 4,
              }}
            >
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={inputStyle}
            >
              <option value="">IN + OUT</option>
              <option value="IN">IN only</option>
              <option value="OUT">OUT only</option>
            </select>
          </div>
          <div style={{ flex: '1 1 130px' }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#64748b',
                display: 'block',
                marginBottom: 4,
              }}
            >
              From date
            </label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '1 1 130px' }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#64748b',
                display: 'block',
                marginBottom: 4,
              }}
            >
              To date
            </label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button
            onClick={() => {
              setFilterProduct('');
              setFilterCategory('');
              setFilterFrom('');
              setFilterTo('');
              setFilterType('');
            }}
            style={{ ...btnSecondary, height: 40, whiteSpace: 'nowrap' }}
          >
            Clear Filters
          </button>
          <button
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
        <StatCard label="Total IN" value={totalIn} accent="#15803d" />
        <StatCard label="Total OUT" value={totalOut} accent="#b91c1c" />
        <StatCard
          label="Net Change"
          value={(totalIn - totalOut >= 0 ? '+' : '') + (totalIn - totalOut)}
          accent={totalIn - totalOut >= 0 ? '#15803d' : '#b91c1c'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            Summary by Product
          </div>
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
                product: p?.name || '—',
                in: <span style={{ color: '#15803d', fontWeight: 600 }}>{d.in}</span>,
                out: <span style={{ color: '#b91c1c', fontWeight: 600 }}>{d.out}</span>,
                net: (
                  <span
                    style={{ color: net >= 0 ? '#15803d' : '#b91c1c', fontWeight: 700 }}
                  >
                    {net >= 0 ? '+' : ''}
                    {net}
                  </span>
                ),
              };
            })}
            emptyMsg="No movements match the selected filters"
          />
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            Movement Log ({filtered.length})
          </div>
          <div
            style={{
              maxHeight: 400,
              overflowY: 'auto',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
            }}
          >
            <Table
              columns={[
                { key: 'date', label: 'Date' },
                { key: 'product', label: 'Product' },
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
                          fontFamily: 'IBM Plex Mono',
                          fontSize: 11,
                          color: '#64748b',
                        }}
                      >
                        {fmtDate(m.created_at)}
                      </span>
                    ),
                    product: p?.name,
                    type: <Badge type={m.movement_type} />,
                    qty: (
                      <span
                        style={{
                          fontWeight: 700,
                          color: m.movement_type === 'IN' ? '#15803d' : '#b91c1c',
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
