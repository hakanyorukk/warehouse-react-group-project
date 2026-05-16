import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import FormField from '../components/FormField';
import Icon from '../components/Icon';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
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

export default function StockEntry() {
  const { products, suppliers, categories, movements, addMovement } = useData();
  const { showToast } = useToast();
  const { session } = useAuth();

  const stock = getStock(movements, products);

  const [form, setForm] = useState({ product_id: '', quantity: '', supplier_id: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const selectedProduct = products.find((p) => p.id === parseInt(form.product_id));
  const selectedCategory = selectedProduct
    ? categories.find((c) => c.id === selectedProduct.category_id)
    : null;

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.product_id) e.product_id = 'Please select a product';
    if (!form.quantity || parseInt(form.quantity) <= 0) e.quantity = 'Enter a valid quantity (> 0)';
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
      supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
      user_id: session?.user?.id || null,
      movement_type: 'IN',
      quantity: parseInt(form.quantity),
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast(`Added ${form.quantity} × ${selectedProduct.name} to stock`, 'success');
    setForm({ product_id: '', quantity: '', supplier_id: '', notes: '' });
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Stock Entry"
        subtitle="Record incoming goods. This increases stock levels."
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
                background: 'var(--c-success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="entry" size={17} color="var(--c-success)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 600 }}>
                New Inbound Entry
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                Record stock received from supplier
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
                    <span style={{ color: 'var(--c-text-soft)' }}>Current:</span>{' '}
                    <strong>{stock[selectedProduct.id] ?? 0}</strong>
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

            {selectedProduct && form.quantity && parseInt(form.quantity) > 0 && (
              <div
                style={{
                  background: 'var(--c-primary-soft)',
                  border: '1px solid #c8d8cc',
                  borderRadius: 'var(--r-sm)',
                  padding: '10px 13px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: 'var(--c-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="trend" size={14} />
                New stock level:{' '}
                <strong>
                  {(stock[selectedProduct.id] ?? 0) + parseInt(form.quantity)} {selectedProduct.unit}
                </strong>
              </div>
            )}

            <FormField label="Supplier (optional)">
              <select
                value={form.supplier_id}
                onChange={(e) => set('supplier_id', e.target.value)}
                style={inputStyle}
              >
                <option value="">— Select supplier —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Notes (optional)">
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="e.g. Delivery reference, condition notes…"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </FormField>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ ...btnPrimary, flex: 1 }}
              >
                {saving ? 'Saving…' : 'Record Entry'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={btnSecondary}
                onClick={() => {
                  setForm({ product_id: '', quantity: '', supplier_id: '', notes: '' });
                  setErrors({});
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div>
          <div style={sectionTitle}>Recent stock entries</div>
          <Table
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'product', label: 'Product' },
              { key: 'sku', label: 'SKU' },
              { key: 'qty', label: 'Qty', right: true },
              { key: 'supplier', label: 'Supplier' },
              { key: 'notes', label: 'Notes' },
            ]}
            rows={[...movements]
              .filter((m) => m.movement_type === 'IN')
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((m) => {
                const p = products.find((x) => x.id === m.product_id);
                const s = suppliers.find((x) => x.id === m.supplier_id);
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
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--c-success)' }}>
                      +{m.quantity}
                    </span>
                  ),
                  supplier: s?.name || <span style={{ color: 'var(--c-text-soft)' }}>—</span>,
                  notes: m.notes || <span style={{ color: 'var(--c-text-soft)' }}>—</span>,
                };
              })}
            emptyMsg="No inbound entries yet"
          />
        </div>
      </div>
    </div>
  );
}
