import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Badge from '../components/Badge';
import FormField from '../components/FormField';
import Icon from '../components/Icon';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import { getStock } from '../helpers';

const EMPTY = { sku: '', name: '', category_id: '', unit: 'pcs', min_stock: '5' };

const linkBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12.5,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '4px 6px',
};

export default function Products() {
  const { products, categories, movements, addProduct, updateProduct, loading } = useData();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null = add mode
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const stock = getStock(movements, products);

  const filtered = products.filter((p) => {
    if (!showArchived && p.is_active === false) return false;
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

  function openAdd() {
    setEditId(null);
    setForm(EMPTY);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(p) {
    setEditId(p.id);
    setForm({
      sku: p.sku,
      name: p.name,
      category_id: String(p.category_id || ''),
      unit: p.unit,
      min_stock: String(p.min_stock),
    });
    setErrors({});
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditId(null);
    setErrors({});
  }

  function validate() {
    const e = {};
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.category_id) e.category_id = 'Select a category';
    if (!form.unit.trim()) e.unit = 'Unit is required';
    if (!form.min_stock || parseInt(form.min_stock) < 0) e.min_stock = 'Enter a valid minimum stock';
    const dup = products.find(
      (p) => p.sku.toLowerCase() === form.sku.trim().toLowerCase() && p.id !== editId
    );
    if (dup) e.sku = 'SKU already exists';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    const payload = {
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      category_id: parseInt(form.category_id),
      unit: form.unit.trim(),
      min_stock: parseInt(form.min_stock),
    };
    const { error } = editId
      ? await updateProduct(editId, payload)
      : await addProduct(payload);
    setSaving(false);
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast(editId ? `Updated ${payload.name}` : `Added ${payload.name}`, 'success');
    closeForm();
  }

  async function toggleArchive(p) {
    const archiving = p.is_active !== false;
    const { error } = await updateProduct(p.id, { is_active: !archiving });
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast(archiving ? `${p.name} archived` : `${p.name} restored`, 'success');
  }

  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Stock', right: true },
    { key: 'unit', label: 'Unit' },
    { key: 'min', label: 'Min', right: true },
    { key: 'status', label: 'Status' },
  ];
  if (isAdmin) columns.push({ key: 'actions', label: '' });

  return (
    <div className="fade-in">
      <PageHeader
        title="Products"
        subtitle="Manage the product catalogue"
        action={
          isAdmin ? (
            <button
              className="btn-primary"
              onClick={() => (formOpen && !editId ? closeForm() : openAdd())}
              style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Icon name="plus" size={14} /> {formOpen && !editId ? 'Cancel' : 'Add Product'}
            </button>
          ) : null
        }
      />

      <div
        className="toolbar-row"
        style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 320 }}>
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--c-text-soft)',
            }}
          >
            <Icon name="search" size={15} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          style={{ ...inputStyle, width: 200 }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {isAdmin && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 13,
              color: 'var(--c-text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              style={{ accentColor: 'var(--c-primary)' }}
            />
            Show archived
          </label>
        )}
      </div>

      {isAdmin && formOpen && (
        <div
          style={{
            background: 'var(--c-surface)',
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--c-border)',
            padding: 20,
            marginBottom: 20,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            {editId ? 'Edit product' : 'Add new product'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid-add-product">
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
                  placeholder="pcs / kg / litre"
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
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary" disabled={saving} style={btnPrimary}>
                {saving ? 'Saving…' : editId ? 'Update Product' : 'Save Product'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={btnSecondary}
                onClick={closeForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <Table
        columns={columns}
        rows={filtered.map((p) => {
          const cat = categories.find((c) => c.id === p.category_id);
          const s = stock[p.id] ?? 0;
          const archived = p.is_active === false;
          const muted = archived ? { color: 'var(--c-text-soft)' } : null;
          return {
            sku: (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--c-text-muted)',
                  ...muted,
                }}
              >
                {p.sku}
              </span>
            ),
            name: <span style={{ fontWeight: 500, ...muted }}>{p.name}</span>,
            category: <span style={muted}>{cat?.name || '—'}</span>,
            stock: (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: archived
                    ? 'var(--c-text-soft)'
                    : s <= p.min_stock
                      ? 'var(--c-warning)'
                      : 'var(--c-success)',
                }}
              >
                {s}
              </span>
            ),
            unit: <span style={muted}>{p.unit}</span>,
            min: <span style={muted}>{p.min_stock}</span>,
            status: archived ? (
              <span
                style={{
                  background: 'var(--c-surface-alt)',
                  color: 'var(--c-text-muted)',
                  border: '1px solid var(--c-border)',
                  padding: '3px 9px',
                  borderRadius: 4,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ARCHIVED
              </span>
            ) : (
              <Badge type={s <= p.min_stock ? 'LOW' : 'OK'} />
            ),
            actions: isAdmin ? (
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => openEdit(p)}
                  style={{ ...linkBtn, color: 'var(--c-primary)' }}
                >
                  <Icon name="edit" size={13} /> Edit
                </button>
                <button
                  onClick={() => toggleArchive(p)}
                  style={{ ...linkBtn, color: 'var(--c-text-muted)' }}
                >
                  <Icon name="archive" size={13} /> {archived ? 'Restore' : 'Archive'}
                </button>
              </div>
            ) : null,
          };
        })}
        emptyMsg={loading ? 'Loading…' : 'No products found'}
      />
    </div>
  );
}
