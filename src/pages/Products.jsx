import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Badge from '../components/Badge';
import FormField from '../components/FormField';
import Icon from '../components/Icon';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import { getStock } from '../helpers';

export default function Products() {
  const { products, categories, movements, addProduct, loading } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    category_id: '',
    unit: 'pcs',
    min_stock: '5',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const stock = getStock(movements, products);

  const filtered = products.filter((p) => {
    if (filterCat && p.category_id !== parseInt(filterCat)) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.sku.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.category_id) e.category_id = 'Select a category';
    if (!form.unit.trim()) e.unit = 'Unit is required';
    if (!form.min_stock || parseInt(form.min_stock) < 0) e.min_stock = 'Enter a valid minimum stock';
    if (
      products.find((p) => p.sku.toLowerCase() === form.sku.trim().toLowerCase())
    )
      e.sku = 'SKU already exists';
    return e;
  }

  async function handleAdd(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    const { error } = await addProduct({
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      category_id: parseInt(form.category_id),
      unit: form.unit.trim(),
      min_stock: parseInt(form.min_stock),
    });
    setSaving(false);
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast(`Added ${form.name.trim()}`, 'success');
    setShowAdd(false);
    setForm({ sku: '', name: '', category_id: '', unit: 'pcs', min_stock: '5' });
  }

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage the product catalogue" />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <span
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          >
            <Icon name="search" size={15} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            style={{ ...inputStyle, paddingLeft: 34 }}
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          style={{ ...inputStyle, width: 180 }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowAdd((s) => !s)}
          style={{ ...btnPrimary, marginLeft: 'auto', whiteSpace: 'nowrap' }}
        >
          {showAdd ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showAdd && (
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}
          >
            Add New Product
          </div>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <FormField label="SKU *" error={errors.sku}>
                <input
                  value={form.sku}
                  onChange={(e) => set('sku', e.target.value)}
                  placeholder="e.g. ELEC-005"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Name *" error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Product name"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Category *" error={errors.category_id}>
                <select
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">— Select —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Unit *" error={errors.unit}>
                <input
                  value={form.unit}
                  onChange={(e) => set('unit', e.target.value)}
                  placeholder="pcs / kg / litre…"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Min Stock *" error={errors.min_stock}>
                <input
                  type="number"
                  min="0"
                  value={form.min_stock}
                  onChange={(e) => set('min_stock', e.target.value)}
                  style={inputStyle}
                />
              </FormField>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="submit" disabled={saving} style={btnPrimary}>
                {saving ? 'Saving…' : 'Save Product'}
              </button>
              <button
                type="button"
                style={btnSecondary}
                onClick={() => {
                  setShowAdd(false);
                  setErrors({});
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <Table
        columns={[
          { key: 'sku', label: 'SKU' },
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'stock', label: 'Stock', right: true },
          { key: 'unit', label: 'Unit' },
          { key: 'min', label: 'Min', right: true },
          { key: 'status', label: 'Status' },
        ]}
        rows={filtered.map((p) => {
          const cat = categories.find((c) => c.id === p.category_id);
          const s = stock[p.id] ?? 0;
          return {
            sku: (
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#64748b' }}>
                {p.sku}
              </span>
            ),
            name: <span style={{ fontWeight: 500 }}>{p.name}</span>,
            category: cat?.name || '—',
            stock: (
              <span
                style={{ fontWeight: 700, color: s <= p.min_stock ? '#d97706' : '#15803d' }}
              >
                {s}
              </span>
            ),
            unit: p.unit,
            min: p.min_stock,
            status: <Badge type={s <= p.min_stock ? 'LOW' : 'OK'} />,
          };
        })}
        emptyMsg={loading ? 'Loading…' : 'No products found'}
      />
    </div>
  );
}
