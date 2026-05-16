import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import FormField from '../components/FormField';
import Icon from '../components/Icon';
import { btnDanger, btnSecondary, inputStyle } from '../styles';
import { fmtDateTime, getStock } from '../helpers';

const cardStyle = {
  background: 'var(--c-surface)',
  borderRadius: 'var(--r-lg)',
  border: '1px solid var(--c-border)',
  padding: 24,
  boxShadow: 'var(--shadow-sm)',
};

const sectionTitle = {
  fontFamily: 'var(--font-head)',
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--c-text)',
  marginBottom: 10,
};

export default function WriteDown() {
  const { products, categories, movements, addMovement } = useData();
  const { showToast } = useToast();
  const { session } = useAuth();

  const stock = getStock(movements, products);

  const [form, setForm] = useState({ product_id: '', quantity: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const selectedProduct = products.find((p) => p.id === parseInt(form.product_id));
  const selectedCategory = selectedProduct
    ? categories.find((c) => c.id === selectedProduct.category_id)
    : null;
  const currentStock = selectedProduct ? stock[selectedProduct.id] ?? 0 : 0;

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.product_id) e.product_id = 'Please select a product';
    const qty = parseInt(form.quantity);
    if (!form.quantity || qty <= 0) e.quantity = 'Enter a valid quantity (> 0)';
    else if (selectedProduct && qty > currentStock)
      e.quantity = `Cannot exceed current stock (${currentStock} ${selectedProduct.unit})`;
    if (!form.notes.trim()) e.notes = 'Reason is required';
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
    const { error } = await addMovement({
      product_id: parseInt(form.product_id),
      supplier_id: null,
      user_id: session?.user?.id || null,
      movement_type: 'OUT',
      quantity: parseInt(form.quantity),
      notes: form.notes,
    });
    setSaving(false);
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast(`Written down ${form.quantity} × ${selectedProduct.name}`, 'success');
    setForm({ product_id: '', quantity: '', notes: '' });
  }

  const qty = parseInt(form.quantity) || 0;
  const remaining = currentStock - qty;

  return (
    <div className="fade-in">
      <PageHeader
        title="Write-Down"
        subtitle="Record outgoing goods or stock reductions. This decreases stock levels."
      />
      <div className="grid-form">
        <div style={cardStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: '1px solid var(--c-border)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--c-danger-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="writedown" size={17} color="var(--c-danger)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 600 }}>
                New Write-Down
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                Record stock issued, damaged, or removed
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <FormField label="Product *" error={errors.product_id}>
              <select
                value={form.product_id}
                onChange={(e) => set('product_id', e.target.value)}
                style={inputStyle}
              >
                <option value="">— Select product —</option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name}>
                    {products
                      .filter((p) => p.category_id === cat.id && p.is_active !== false)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </FormField>

            {selectedProduct && (
              <div
                style={{
                  background: 'var(--c-surface-alt)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--r-sm)',
                  padding: '12px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
                  <div>
                    <span style={{ color: 'var(--c-text-soft)' }}>SKU:</span>{' '}
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                      {selectedProduct.sku}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-soft)' }}>Unit:</span> {selectedProduct.unit}
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-soft)' }}>Category:</span>{' '}
                    {selectedCategory?.name}
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-soft)' }}>Available:</span>{' '}
                    <strong
                      style={{
                        color:
                          currentStock <= selectedProduct.min_stock
                            ? 'var(--c-warning)'
                            : 'var(--c-success)',
                      }}
                    >
                      {currentStock}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <FormField
              label={`Quantity ${selectedProduct ? `(${selectedProduct.unit})` : ''} *`}
              error={errors.quantity}
            >
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                placeholder="Enter quantity"
                style={inputStyle}
              />
            </FormField>

            {selectedProduct && qty > 0 && qty <= currentStock && (
              <div
                style={{
                  background:
                    remaining <= selectedProduct.min_stock
                      ? 'var(--c-warning-bg)'
                      : 'var(--c-surface-alt)',
                  border: `1px solid ${
                    remaining <= selectedProduct.min_stock ? '#fde68a' : 'var(--c-border)'
                  }`,
                  borderRadius: 'var(--r-sm)',
                  padding: '10px 13px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: remaining <= selectedProduct.min_stock ? 'var(--c-warning)' : 'var(--c-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {remaining <= selectedProduct.min_stock && <Icon name="warn" size={14} />}
                Stock after:{' '}
                <strong>
                  {remaining} {selectedProduct.unit}
                </strong>
                {remaining <= selectedProduct.min_stock && ' — below minimum'}
              </div>
            )}

            <FormField label="Reason / Notes *" error={errors.notes}>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="e.g. Issued to department, damaged, expired…"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </FormField>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="submit"
                className="btn-danger"
                disabled={saving}
                style={{ ...btnDanger, flex: 1 }}
              >
                {saving ? 'Saving…' : 'Record Write-Down'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={btnSecondary}
                onClick={() => {
                  setForm({ product_id: '', quantity: '', notes: '' });
                  setErrors({});
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div>
          <div style={sectionTitle}>Recent write-downs</div>
          <Table
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'product', label: 'Product' },
              { key: 'sku', label: 'SKU' },
              { key: 'qty', label: 'Qty', right: true },
              { key: 'notes', label: 'Reason' },
            ]}
            rows={[...movements]
              .filter((m) => m.movement_type === 'OUT')
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
                      {fmtDateTime(m.created_at)}
                    </span>
                  ),
                  product: <span style={{ fontWeight: 500 }}>{p?.name}</span>,
                  sku: (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--c-text-muted)',
                      }}
                    >
                      {p?.sku}
                    </span>
                  ),
                  qty: (
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--c-danger)' }}>
                      −{m.quantity}
                    </span>
                  ),
                  notes: m.notes || <span style={{ color: 'var(--c-text-soft)' }}>—</span>,
                };
              })}
            emptyMsg="No write-downs yet"
          />
        </div>
      </div>
    </div>
  );
}
